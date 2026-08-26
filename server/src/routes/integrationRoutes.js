const express = require('express');
const { body, validationResult } = require('express-validator');
const integrationController = require('../controllers/integrationController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: errors.array().map(e => e.msg).join(', ')
      }
    });
  }
  next();
};

// Public OAuth callbacks (provider redirects here)
router.get('/oauth/error', integrationController.oauthError);
router.get('/oauth/:provider/callback', integrationController.handleCallback);

// Protected routes
router.use(requireAuth);

router.get('/', integrationController.listIntegrations);
router.get('/status', integrationController.getStatus);
router.get('/oauth/:provider/start', integrationController.startOAuth);

router.post(
  '/',
  [
    body('provider').isIn(['gmail', 'slack', 'google-sheets', 'discord', 'openrouter', 'gemini']).withMessage('Valid provider is required'),
    body('credentials').notEmpty().withMessage('Credentials object is required')
  ],
  validate,
  integrationController.saveManual
);

router.post('/test/:provider', integrationController.testConnection);

module.exports = router;
