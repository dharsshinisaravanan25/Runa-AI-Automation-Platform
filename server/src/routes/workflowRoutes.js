const express = require('express');
const { body, validationResult } = require('express-validator');
const workflowController = require('../controllers/workflowController');
const copilotController = require('../controllers/copilotController');
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

router.use(requireAuth);

router.get('/dashboard', workflowController.getDashboard);
router.get('/', workflowController.listWorkflows);

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Workflow name is required').trim()
  ],
  validate,
  workflowController.createWorkflow
);

router.post(
  '/generate',
  [
    body('prompt').notEmpty().withMessage('Natural language prompt is required').trim()
  ],
  validate,
  workflowController.generateFromPrompt
);

router.get('/:id', workflowController.getWorkflow);
router.put('/:id', workflowController.updateWorkflow);
router.post('/:id/duplicate', workflowController.duplicateWorkflow);
router.post('/:id/execute', workflowController.executeWorkflow);
router.post('/:id/copilot', copilotController.chatWithCopilot.bind(copilotController));
router.delete('/:id', workflowController.deleteWorkflow);

module.exports = router;
