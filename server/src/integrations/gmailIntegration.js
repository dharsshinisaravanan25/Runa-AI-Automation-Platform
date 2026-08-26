const BaseIntegration = require('./baseIntegration');
const axios = require('axios');
const env = require('../config/env');

class GmailIntegration extends BaseIntegration {
  constructor() {
    super('gmail');
  }

  async getAuthUrl(state) {
    if (!env.GMAIL_CLIENT_ID) {
      // Mock OAuth URL for local testing
      return `${env.GMAIL_REDIRECT_URI}?code=mock_gmail_code_sandbox&state=${state}`;
    }
    const scopes = encodeURIComponent('https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly');
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${env.GMAIL_CLIENT_ID}&redirect_uri=${encodeURIComponent(env.GMAIL_REDIRECT_URI)}&response_type=code&scope=${scopes}&access_type=offline&prompt=consent&state=${state}`;
  }

  async exchangeCodeForTokens(code) {
    if (code === 'mock_gmail_code_sandbox' || !env.GMAIL_CLIENT_ID) {
      return {
        accessToken: 'mock_gmail_access_token_nxt_' + Date.now(),
        refreshToken: 'mock_gmail_refresh_token_nxt_' + Date.now(),
        expiresAt: new Date(Date.now() + 3600 * 1000),
        scopes: ['gmail.send', 'gmail.readonly'],
        accountEmail: 'operator@agentflow.ai',
        accountName: 'AgentFlow Operator'
      };
    }

    const response = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: env.GMAIL_CLIENT_ID,
      client_secret: env.GMAIL_CLIENT_SECRET,
      redirect_uri: env.GMAIL_REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    const data = response.data;
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + (data.expires_in || 3600) * 1000),
      scopes: data.scope ? data.scope.split(' ') : ['gmail.send'],
      accountEmail: 'google-user@connected.com',
      accountName: 'Google Account'
    };
  }

  async refreshToken(refreshToken) {
    if (!env.GMAIL_CLIENT_ID || refreshToken.startsWith('mock_')) {
      return {
        accessToken: 'mock_refreshed_gmail_token_' + Date.now(),
        expiresAt: new Date(Date.now() + 3600 * 1000)
      };
    }

    const response = await axios.post('https://oauth2.googleapis.com/token', {
      refresh_token: refreshToken,
      client_id: env.GMAIL_CLIENT_ID,
      client_secret: env.GMAIL_CLIENT_SECRET,
      grant_type: 'refresh_token'
    });

    return {
      accessToken: response.data.access_token,
      expiresAt: new Date(Date.now() + (response.data.expires_in || 3600) * 1000)
    };
  }

  async testConnection(credentials) {
    if (!credentials || !credentials.accessToken) {
      return { success: false, message: 'No credentials provided for Gmail integration.' };
    }
    if (credentials.accessToken.startsWith('mock_')) {
      return { success: true, message: 'Gmail sandbox connected successfully.', account: 'operator@agentflow.ai' };
    }

    try {
      const res = await axios.get('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: { Authorization: `Bearer ${credentials.accessToken}` }
      });
      return { success: true, message: 'Gmail connected', account: res.data.emailAddress };
    } catch (err) {
      return { success: false, message: err.response?.data?.error?.message || err.message };
    }
  }

  async executeAction(action, params, credentials) {
    const isMock = !credentials || !credentials.accessToken || credentials.accessToken.startsWith('mock_');

    switch (action) {
      case 'send_email': {
        const { to, subject, body, cc } = params;
        if (!to || !subject) {
          throw new Error('Missing required fields: to and subject are required for send_email');
        }

        if (isMock) {
          return {
            status: 'sent',
            messageId: 'mock_msg_' + Math.random().toString(36).substring(7),
            to,
            subject,
            snippet: body ? body.substring(0, 80) : '',
            timestamp: new Date().toISOString(),
            mode: 'sandbox'
          };
        }

        // Live Gmail API Base64 send
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
        const messageParts = [
          `To: ${to}`,
          cc ? `Cc: ${cc}` : '',
          'Content-Type: text/html; charset=utf-8',
          'MIME-Version: 1.0',
          `Subject: ${utf8Subject}`,
          '',
          body || ''
        ].filter(Boolean);
        const rawMessage = Buffer.from(messageParts.join('\n'))
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        const res = await axios.post(
          'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
          { raw: rawMessage },
          { headers: { Authorization: `Bearer ${credentials.accessToken}` } }
        );

        return {
          status: 'sent',
          messageId: res.data.id,
          threadId: res.data.threadId,
          to,
          subject,
          timestamp: new Date().toISOString()
        };
      }

      case 'read_inbox': {
        const { query = '', maxResults = 5 } = params;
        if (isMock) {
          return {
            messages: [
              {
                id: 'mock_msg_001',
                from: 'client-support@acmecorp.com',
                subject: 'High Priority: Database sync delay detected',
                body: 'We noticed the sync pipeline has a 4 minute delay on table shards.',
                date: new Date().toISOString()
              },
              {
                id: 'mock_msg_002',
                from: 'billing@enterprise.io',
                subject: 'Invoice #4092 Approval Required',
                body: 'Please review and approve the attached vendor invoice for $12,500.',
                date: new Date().toISOString()
              }
            ],
            totalResults: 2,
            query
          };
        }

        const listRes = await axios.get('https://gmail.googleapis.com/gmail/v1/users/me/messages', {
          headers: { Authorization: `Bearer ${credentials.accessToken}` },
          params: { q: query, maxResults }
        });

        return {
          messages: listRes.data.messages || [],
          resultSizeEstimate: listRes.data.resultSizeEstimate,
          query
        };
      }

      default:
        throw new Error(`Unsupported Gmail action: ${action}`);
    }
  }
}

module.exports = new GmailIntegration();
