const BaseIntegration = require('./baseIntegration');
const axios = require('axios');
const env = require('../config/env');

class SlackIntegration extends BaseIntegration {
  constructor() {
    super('slack');
  }

  async getAuthUrl(state) {
    if (!env.SLACK_CLIENT_ID) {
      return `${env.SLACK_REDIRECT_URI}?code=mock_slack_code_sandbox&state=${state}`;
    }
    const scopes = encodeURIComponent('chat:write,channels:read,incoming-webhook');
    return `https://slack.com/oauth/v2/authorize?client_id=${env.SLACK_CLIENT_ID}&scope=${scopes}&redirect_uri=${encodeURIComponent(env.SLACK_REDIRECT_URI)}&state=${state}`;
  }

  async exchangeCodeForTokens(code) {
    if (code === 'mock_slack_code_sandbox' || !env.SLACK_CLIENT_ID) {
      return {
        accessToken: 'mock_xoxb_slack_token_' + Date.now(),
        scopes: ['chat:write', 'channels:read'],
        accountEmail: 'slack-admin@agentflow.ai',
        accountName: 'AgentFlow Workspace',
        botUserId: 'U_AGENTFLOW_BOT'
      };
    }

    const response = await axios.post('https://slack.com/api/oauth.v2.access', null, {
      params: {
        code,
        client_id: env.SLACK_CLIENT_ID,
        client_secret: env.SLACK_CLIENT_SECRET,
        redirect_uri: env.SLACK_REDIRECT_URI
      }
    });

    const data = response.data;
    if (!data.ok) {
      throw new Error(`Slack OAuth error: ${data.error}`);
    }

    return {
      accessToken: data.access_token || data.bot_user_id,
      scopes: data.scope ? data.scope.split(',') : [],
      accountName: data.team?.name || 'Slack Workspace',
      botUserId: data.bot_user_id
    };
  }

  async testConnection(credentials) {
    if (!credentials || !credentials.accessToken) {
      return { success: false, message: 'No credentials provided for Slack integration.' };
    }
    if (credentials.accessToken.startsWith('mock_')) {
      return { success: true, message: 'Slack sandbox connected.', workspace: 'Agentflow AI Ops' };
    }

    try {
      const res = await axios.post('https://slack.com/api/auth.test', {}, {
        headers: { Authorization: `Bearer ${credentials.accessToken}` }
      });
      if (res.data.ok) {
        return { success: true, message: 'Slack connected', workspace: res.data.team, user: res.data.user };
      }
      return { success: false, message: res.data.error };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  async executeAction(action, params, credentials) {
    const isMock = !credentials || !credentials.accessToken || credentials.accessToken.startsWith('mock_');

    switch (action) {
      case 'post_message':
      case 'send_message': {
        const { channel = '#general', message = '', text = '', blocks } = params;
        const messageText = message || text;
        if (!messageText && !blocks) {
          throw new Error('Missing required message content for Slack notification');
        }

        if (isMock) {
          return {
            status: 'posted',
            channel,
            ts: Date.now().toString(),
            message: messageText,
            blocks: blocks || null,
            timestamp: new Date().toISOString(),
            mode: 'sandbox'
          };
        }

        const payload = {
          channel,
          text: messageText
        };
        if (blocks) payload.blocks = typeof blocks === 'string' ? JSON.parse(blocks) : blocks;

        const res = await axios.post('https://slack.com/api/chat.postMessage', payload, {
          headers: { Authorization: `Bearer ${credentials.accessToken}` }
        });

        if (!res.data.ok) {
          throw new Error(`Slack chat.postMessage failed: ${res.data.error}`);
        }

        return {
          status: 'posted',
          channel: res.data.channel,
          ts: res.data.ts,
          message: res.data.message?.text
        };
      }

      case 'list_channels': {
        if (isMock) {
          return {
            channels: [
              { id: 'C01', name: 'general', is_private: false },
              { id: 'C02', name: 'ops-alerts', is_private: false },
              { id: 'C03', name: 'incident-room', is_private: true }
            ]
          };
        }

        const res = await axios.get('https://slack.com/api/conversations.list', {
          headers: { Authorization: `Bearer ${credentials.accessToken}` }
        });

        return {
          channels: res.data.channels || []
        };
      }

      default:
        throw new Error(`Unsupported Slack action: ${action}`);
    }
  }
}

module.exports = new SlackIntegration();
