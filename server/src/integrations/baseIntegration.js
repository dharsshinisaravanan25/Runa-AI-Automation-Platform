/**
 * Base Integration Interface
 * All third-party integrations (Gmail, Slack, Discord, Google Sheets, AI) extend this class.
 */
class BaseIntegration {
  constructor(providerName) {
    this.providerName = providerName;
  }

  /**
   * Generates OAuth authorization URL
   * @param {string} state - Secure state parameter
   * @returns {string} Auth URL
   */
  async getAuthUrl(state) {
    throw new Error(`getAuthUrl not implemented for provider ${this.providerName}`);
  }

  /**
   * Exchanges authorization code for tokens
   * @param {string} code - OAuth code from provider callback
   * @returns {Promise<Object>} Token payload { accessToken, refreshToken, expiresAt, scopes, accountEmail }
   */
  async exchangeCodeForTokens(code) {
    throw new Error(`exchangeCodeForTokens not implemented for provider ${this.providerName}`);
  }

  /**
   * Refreshes expired access tokens using the refresh token
   * @param {string} refreshToken
   * @returns {Promise<Object>} New token payload
   */
  async refreshToken(refreshToken) {
    throw new Error(`refreshToken not implemented for provider ${this.providerName}`);
  }

  /**
   * Tests whether integration credentials are functional and valid
   * @param {Object} credentials - Decrypted credentials
   * @returns {Promise<Object>} { success: boolean, message: string, details?: Object }
   */
  async testConnection(credentials) {
    throw new Error(`testConnection not implemented for provider ${this.providerName}`);
  }

  /**
   * Executes a workflow node action against this integration
   * @param {string} action - Action name (e.g. 'send_email', 'post_message', 'append_row')
   * @param {Object} params - Dynamic node parameters resolved by the execution agent
   * @param {Object} credentials - Decrypted credentials (or null if mock sandbox)
   * @returns {Promise<Object>} Action execution result { success: boolean, output: Object }
   */
  async executeAction(action, params, credentials) {
    throw new Error(`executeAction not implemented for provider ${this.providerName}`);
  }
}

module.exports = BaseIntegration;
