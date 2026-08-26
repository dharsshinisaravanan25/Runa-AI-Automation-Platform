const integrationService = require('../services/integrationService');
const env = require('../config/env');

class IntegrationController {
  async listIntegrations(req, res, next) {
    try {
      const list = await integrationService.listUserIntegrations(req.user.id);
      return res.status(200).json({
        success: true,
        data: { integrations: list }
      });
    } catch (err) {
      next(err);
    }
  }

  async getStatus(req, res, next) {
    try {
      const { provider } = req.query;
      if (provider) {
        const status = await integrationService.getIntegrationStatus(req.user.id, provider);
        return res.status(200).json({ success: true, data: status });
      }

      const list = await integrationService.listUserIntegrations(req.user.id);
      return res.status(200).json({ success: true, data: { integrations: list } });
    } catch (err) {
      next(err);
    }
  }

  async startOAuth(req, res, next) {
    try {
      const { provider } = req.params;
      const authUrl = await integrationService.getOAuthStartUrl(provider, req.user.id);
      return res.status(200).json({
        success: true,
        data: { authUrl }
      });
    } catch (err) {
      next(err);
    }
  }

  async handleCallback(req, res, next) {
    try {
      const { provider } = req.params;
      const { code, state } = req.query;

      if (!code) {
        return res.redirect(`${env.CLIENT_URL}/integrations?error=missing_code&provider=${provider}`);
      }

      await integrationService.handleOAuthCallback(provider, code, state);
      return res.redirect(`${env.CLIENT_URL}/integrations?success=true&provider=${provider}`);
    } catch (err) {
      console.error('OAuth Callback error:', err.message);
      return res.redirect(`${env.CLIENT_URL}/integrations?error=${encodeURIComponent(err.message)}&provider=${req.params.provider}`);
    }
  }

  async oauthError(req, res, next) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'OAUTH_ERROR',
        message: req.query.error_description || 'OAuth authorization was cancelled or failed'
      }
    });
  }

  async saveManual(req, res, next) {
    try {
      const { provider, credentials } = req.body;
      const result = await integrationService.saveManualCredentials(req.user.id, provider, credentials);
      return res.status(200).json({
        success: true,
        message: `${provider} credentials encrypted and saved successfully.`,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async testConnection(req, res, next) {
    try {
      const { provider } = req.params;
      const testResult = await integrationService.testProviderConnection(req.user.id, provider);
      return res.status(200).json({
        success: testResult.success,
        data: testResult
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new IntegrationController();
