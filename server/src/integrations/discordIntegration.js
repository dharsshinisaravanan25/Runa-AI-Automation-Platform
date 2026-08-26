const BaseIntegration = require('./baseIntegration');
const axios = require('axios');
const env = require('../config/env');

class DiscordIntegration extends BaseIntegration {
  constructor() {
    super('discord');
  }

  async getAuthUrl(state) {
    if (!env.DISCORD_CLIENT_ID) {
      return `${env.DISCORD_REDIRECT_URI}?code=mock_discord_code_sandbox&state=${state}`;
    }
    const scopes = encodeURIComponent('bot messages.read');
    return `https://discord.com/api/oauth2/authorize?client_id=${env.DISCORD_CLIENT_ID}&permissions=2048&scope=${scopes}&redirect_uri=${encodeURIComponent(env.DISCORD_REDIRECT_URI)}&response_type=code&state=${state}`;
  }

  async exchangeCodeForTokens(code) {
    if (code === 'mock_discord_code_sandbox' || !env.DISCORD_CLIENT_ID) {
      return {
        accessToken: 'mock_discord_bot_token_' + Date.now(),
        scopes: ['bot', 'messages.read'],
        accountName: 'Agentflow AI Bot',
        guildName: 'Agentic Ops Server'
      };
    }

    const params = new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID,
      client_secret: env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: env.DISCORD_REDIRECT_URI
    });

    const response = await axios.post('https://discord.com/api/v10/oauth2/token', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresAt: new Date(Date.now() + response.data.expires_in * 1000),
      scopes: response.data.scope.split(' '),
      guildName: response.data.guild?.name || 'Discord Server'
    };
  }

  async testConnection(credentials) {
    if (!credentials || !credentials.accessToken) {
      return { success: false, message: 'No credentials provided for Discord integration.' };
    }
    if (credentials.accessToken.startsWith('mock_')) {
      return { success: true, message: 'Discord sandbox connected.', guild: 'Agentflow Ops Guild' };
    }

    try {
      const res = await axios.get('https://discord.com/api/v10/users/@me', {
        headers: { Authorization: `Bearer ${credentials.accessToken}` }
      });
      return { success: true, message: 'Discord bot connected', user: res.data.username };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  async executeAction(action, params, credentials) {
    const isMock = !credentials || !credentials.accessToken || credentials.accessToken.startsWith('mock_');

    switch (action) {
      case 'post_message':
      case 'send_message':
      case 'send_webhook': {
        const { channelId, webhookUrl, content = '', message = '', title, description, color } = params;
        const textContent = content || message;

        if (isMock) {
          return {
            status: 'sent',
            channelId: channelId || 'mock_channel_123',
            content: textContent,
            embed: title ? { title, description } : null,
            timestamp: new Date().toISOString(),
            mode: 'sandbox'
          };
        }

        const payload = {};
        if (textContent) payload.content = textContent;
        if (title || description) {
          payload.embeds = [{
            title: title || 'Agentflow Automation Alert',
            description: description || textContent,
            color: color || 3447003, // Neon Cyan
            timestamp: new Date().toISOString()
          }];
        }

        if (webhookUrl) {
          const res = await axios.post(webhookUrl, payload);
          return { status: 'sent', via: 'webhook', data: res.data };
        } else if (channelId && credentials.accessToken) {
          const token = env.DISCORD_BOT_TOKEN || credentials.accessToken;
          const authHeader = token.startsWith('Bot ') ? token : `Bot ${token}`;
          const res = await axios.post(`https://discord.com/api/v10/channels/${channelId}/messages`, payload, {
            headers: { Authorization: authHeader }
          });
          return { status: 'sent', id: res.data.id, channelId: res.data.channel_id };
        } else {
          throw new Error('Discord action requires either webhookUrl or channelId with Bot Token');
        }
      }

      default:
        throw new Error(`Unsupported Discord action: ${action}`);
    }
  }
}

module.exports = new DiscordIntegration();
