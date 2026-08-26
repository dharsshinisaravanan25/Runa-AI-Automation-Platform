const workflowService = require('../services/workflowService');
const executionService = require('../services/executionService');
const aiService = require('../services/aiService');

class WorkflowController {
  async getDashboard(req, res, next) {
    try {
      const stats = await workflowService.getDashboardMetrics(req.user.id);
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (err) {
      next(err);
    }
  }

  async listWorkflows(req, res, next) {
    try {
      const result = await workflowService.listWorkflows(req.user.id, req.query);
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async createWorkflow(req, res, next) {
    try {
      const workflow = await workflowService.createWorkflow(req.user.id, req.body);
      return res.status(201).json({
        success: true,
        message: 'Workflow created successfully',
        data: { workflow }
      });
    } catch (err) {
      next(err);
    }
  }

  async generateFromPrompt(req, res, next) {
    try {
      const { prompt } = req.body;
      const generatedGraph = await aiService.generateWorkflowFromPrompt(prompt, req.user.id);
      return res.status(200).json({
        success: true,
        message: 'AI Workflow Graph generated successfully',
        data: { workflow: generatedGraph }
      });
    } catch (err) {
      next(err);
    }
  }

  async getWorkflow(req, res, next) {
    try {
      const workflow = await workflowService.getWorkflowById(req.params.id, req.user.id);
      return res.status(200).json({
        success: true,
        data: { workflow }
      });
    } catch (err) {
      next(err);
    }
  }

  async updateWorkflow(req, res, next) {
    try {
      const workflow = await workflowService.updateWorkflow(req.params.id, req.user.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Workflow updated successfully',
        data: { workflow }
      });
    } catch (err) {
      next(err);
    }
  }

  async duplicateWorkflow(req, res, next) {
    try {
      const cloned = await workflowService.duplicateWorkflow(req.params.id, req.user.id);
      return res.status(201).json({
        success: true,
        message: 'Workflow cloned successfully',
        data: { workflow: cloned }
      });
    } catch (err) {
      next(err);
    }
  }

  async executeWorkflow(req, res, next) {
    try {
      const execution = await executionService.triggerExecution(
        req.params.id,
        req.user.id,
        req.body.inputs || {}
      );
      return res.status(202).json({
        success: true,
        message: 'Workflow execution triggered',
        data: { execution }
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteWorkflow(req, res, next) {
    try {
      const result = await workflowService.deleteWorkflow(req.params.id, req.user.id);
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new WorkflowController();
