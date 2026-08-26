/**
 * Base Integration Interface
 * All third-party integrations (Gmail, Slack, Discord, Google Sheets, WhatsApp, Telegram, Social, AI) extend this class.
 */
class BaseIntegration {
  constructor(providerName) {
    this.providerName = providerName;
  }

  async getAuthUrl(state) {
    throw new Error(`getAuthUrl not implemented for provider ${this.providerName}`);
  }

  async exchangeCodeForTokens(code) {
    throw new Error(`exchangeCodeForTokens not implemented for provider ${this.providerName}`);
  }

  async refreshToken(refreshToken) {
    throw new Error(`refreshToken not implemented for provider ${this.providerName}`);
  }

  async testConnection(credentials) {
    throw new Error(`testConnection not implemented for provider ${this.providerName}`);
  }

  async executeAction(action, params, credentials) {
    if (typeof this.execute === 'function') {
      return await this.execute(action, params, credentials);
    }
    throw new Error(`executeAction not implemented for provider ${this.providerName}`);
  }

  async execute(action, params, credentials) {
    if (typeof this.executeAction === 'function') {
      return await this.executeAction(action, params, credentials);
    }
    throw new Error(`execute not implemented for provider ${this.providerName}`);
  }
}

module.exports = BaseIntegration;
