const crypto = require('crypto');
const env = require('../config/env');
const db = require('../models/dbAdapter');
const gmailIntegration = require('../integrations/gmailIntegration');
const slackIntegration = require('../integrations/slackIntegration');
const discordIntegration = require('../integrations/discordIntegration');
const googleSheetsIntegration = require('../integrations/googleSheetsIntegration');
const aiIntegration = require('../integrations/aiIntegration');
const whatsappIntegration = require('../integrations/whatsappIntegration');
const telegramIntegration = require('../integrations/telegramIntegration');
const socialIntegration = require('../integrations/socialIntegration');

// AES-256-GCM Encryption utilities
const ALGORITHM = 'aes-256-gcm';

const getEncryptionKey = () => {
  const rawKey = env.CREDENTIAL_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  return crypto.createHash('sha256').update(rawKey).digest();
};

const encryptData = (plainObject) => {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const text = typeof plainObject === 'string' ? plainObject : JSON.stringify(plainObject);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    iv: iv.toString('hex'),
    authTag,
    encryptedData: encrypted
  };
};

const decryptData = (encryptedPayload) => {
  if (!encryptedPayload || !encryptedPayload.iv || !encryptedPayload.authTag || !encryptedPayload.encryptedData) {
    return null;
  }
  try {
    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(encryptedPayload.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(encryptedPayload.authTag, 'hex'));

    let decrypted = decipher.update(encryptedPayload.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (err) {
    console.error('Failed to decrypt credentials payload:', err.message);
    return null;
  }
};

class IntegrationService {
  constructor() {
    this.providers = {
      gmail: gmailIntegration,
      slack: slackIntegration,
      discord: discordIntegration,
      'google-sheets': googleSheetsIntegration,
      ai: aiIntegration,
      whatsapp: whatsappIntegration,
      telegram: telegramIntegration
    };
  }

  getProviderHandler(provider) {
    if (provider === 'linkedin' || provider === 'instagram' || provider === 'facebook') {
      return socialIntegration;
    }
    const handler = this.providers[provider];
    if (!handler) {
      throw new Error(`Unsupported integration provider: ${provider}`);
    }
    return handler;
  }

  async listUserIntegrations(userId) {
    const records = await db.Integration.find({ owner: userId });
    const allProviders = [
      { id: 'whatsapp', name: 'WhatsApp Business API', icon: 'MessageCircle', description: 'Dispatch templates, OTPs, and direct customer messages' },
      { id: 'telegram', name: 'Telegram Bot API', icon: 'Send', description: 'Group alerts, bot commands, and channel broadcasts' },
      { id: 'linkedin', name: 'LinkedIn Marketing & Outreach', icon: 'Linkedin', description: 'Auto-publish articles, executive updates, and lead outreach' },
      { id: 'instagram', name: 'Instagram Graph API', icon: 'Instagram', description: 'Auto-post captions, reels, and smart DM replies' },
      { id: 'facebook', name: 'Facebook Graph API', icon: 'Facebook', description: 'Page broadcasts, messenger automation, and lead ad processing' },
      { id: 'gmail', name: 'Gmail API Vault', icon: 'Mail', description: 'Send and read email messages & incoming triggers' },
      { id: 'slack', name: 'Slack Bot Workspace', icon: 'MessageSquare', description: 'Post alerts, rich blocks, & war room updates' },
      { id: 'discord', name: 'Discord Webhook & Bot', icon: 'Bot', description: 'Post webhook messages & server announcements' },
      { id: 'google-sheets', name: 'Google Sheets DB', icon: 'Table', description: 'Append rows, read data ranges, & sync sheets' },
      { id: 'gemini', name: 'Google Gemini SDK', icon: 'Sparkles', description: 'Google Gemini 2.5 Flash Multimodal Generative AI' }
    ];

    const result = allProviders.map(p => {
      const record = records.find(r => r.provider === p.id);
      const isConnected = record ? record.isConnected : false;
      const isExpired = record && record.expiresAt && new Date(record.expiresAt) < new Date();

      return {
        provider: p.id,
        name: p.name,
        icon: p.icon,
        description: p.description,
        isConnected: isConnected && !isExpired,
        accountEmail: record?.accountEmail || (isConnected ? 'connected@runa.ai' : null),
        accountName: record?.accountName || null,
        scopes: record?.scopes || [],
        expiresAt: record?.expiresAt || null,
        updatedAt: record?.updatedAt || null
      };
    });

    return result;
  }

  async getIntegrationStatus(userId, provider) {
    const record = await db.Integration.findOne({ owner: userId, provider });
    if (!record || !record.isConnected) {
      return { isConnected: false, status: 'DISCONNECTED' };
    }
    const isExpired = record.expiresAt && new Date(record.expiresAt) < new Date();
    return {
      isConnected: !isExpired,
      status: isExpired ? 'AUTH_EXPIRED' : 'CONNECTED',
      accountEmail: record.accountEmail,
      expiresAt: record.expiresAt
    };
  }

  async getOAuthStartUrl(provider, userId) {
    const handler = this.getProviderHandler(provider);
    const state = Buffer.from(JSON.stringify({ userId, provider, ts: Date.now() })).toString('base64');
    return await handler.getAuthUrl(state);
  }

  async handleOAuthCallback(provider, code, state) {
    let userId = null;
    try {
      const parsedState = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
      userId = parsedState.userId;
    } catch (e) {
      // fallback
    }

    const handler = this.getProviderHandler(provider);
    const tokens = await handler.exchangeCodeForTokens(code);

    const encryptedCredentials = encryptData({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      apiKey: tokens.apiKey,
      botUserId: tokens.botUserId
    });

    const existing = userId ? await db.Integration.findOne({ owner: userId, provider }) : null;

    if (existing) {
      await db.Integration.findByIdAndUpdate(existing._id, {
        isConnected: true,
        scopes: tokens.scopes || [],
        accountEmail: tokens.accountEmail || existing.accountEmail,
        accountName: tokens.accountName || existing.accountName,
        encryptedCredentials,
        expiresAt: tokens.expiresAt || null
      });
    } else if (userId) {
      await db.Integration.create({
        owner: userId,
        provider,
        isConnected: true,
        scopes: tokens.scopes || [],
        accountEmail: tokens.accountEmail || '',
        accountName: tokens.accountName || '',
        encryptedCredentials,
        expiresAt: tokens.expiresAt || null
      });
    }

    return { success: true, provider, accountEmail: tokens.accountEmail };
  }

  async saveManualCredentials(userId, provider, credentials) {
    const encryptedCredentials = encryptData(credentials);
    const existing = await db.Integration.findOne({ owner: userId, provider });

    if (existing) {
      await db.Integration.findByIdAndUpdate(existing._id, {
        isConnected: true,
        accountEmail: credentials.accountEmail || credentials.email || `${provider}@connected.local`,
        accountName: credentials.accountName || provider,
        encryptedCredentials,
        expiresAt: null
      });
    } else {
      await db.Integration.create({
        owner: userId,
        provider,
        isConnected: true,
        accountEmail: credentials.accountEmail || credentials.email || `${provider}@connected.local`,
        accountName: credentials.accountName || provider,
        encryptedCredentials,
        expiresAt: null
      });
    }

    return { success: true, provider };
  }

  async getDecryptedCredentials(userId, provider) {
    const record = await db.Integration.findOne({ owner: userId, provider });
    if (!record || !record.isConnected) {
      return null;
    }
    return decryptData(record.encryptedCredentials);
  }

  async executeNodeAction(userId, provider, action, params) {
    // 1. Triggers and core logic nodes
    if (provider === 'webhook' || provider === 'schedule' || provider === 'trigger' || provider === 'core' || provider === 'manual') {
      return {
        status: 'triggered',
        timestamp: new Date().toISOString(),
        payload: params.inputData?.trigger || params || {},
        mode: 'event_stream'
      };
    }

    // 2. AI Providers
    if (provider === 'ai' || provider === 'openrouter' || provider === 'gemini') {
      const credentials = await this.getDecryptedCredentials(userId, provider);
      return await aiIntegration.executeAction(action, params, credentials);
    }

    // 3. Social Providers (LinkedIn, Instagram, Facebook)
    if (provider === 'linkedin' || provider === 'instagram' || provider === 'facebook') {
      const credentials = await this.getDecryptedCredentials(userId, provider);
      return await socialIntegration.executeSocial(provider, action, params, credentials || { apiKey: 'mock_social_key' });
    }

    // 4. Messaging & Apps (WhatsApp, Telegram, Gmail, Slack, Discord, Sheets)
    const handler = this.getProviderHandler(provider);
    const credentials = await this.getDecryptedCredentials(userId, provider);

    return await handler.execute(action, params, credentials || { accessToken: 'mock_sandbox_token' });
  }

  async testProviderConnection(userId, provider) {
    if (provider === 'linkedin' || provider === 'instagram' || provider === 'facebook') {
      const credentials = await this.getDecryptedCredentials(userId, provider);
      return await socialIntegration.testConnection(provider, credentials || { apiKey: 'mock_social_key' });
    }

    const handler = this.getProviderHandler(provider);
    const credentials = await this.getDecryptedCredentials(userId, provider);
    return await handler.testConnection(credentials || { accessToken: 'mock_sandbox_token' });
  }
}

module.exports = new IntegrationService();
