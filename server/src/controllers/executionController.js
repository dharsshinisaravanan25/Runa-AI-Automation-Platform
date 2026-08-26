const executionService = require('../services/executionService');

class ExecutionController {
  async listExecutions(req, res, next) {
    try {
      const result = await executionService.listExecutions(req.user.id, req.query);
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async getExecution(req, res, next) {
    try {
      const execution = await executionService.getExecutionById(req.params.id, req.user.id);
      return res.status(200).json({
        success: true,
        data: { execution }
      });
    } catch (err) {
      next(err);
    }
  }

  async getTimeline(req, res, next) {
    try {
      const timeline = await executionService.getExecutionTimeline(req.params.id, req.user.id);
      return res.status(200).json({
        success: true,
        data: { timeline }
      });
    } catch (err) {
      next(err);
    }
  }

  async pauseExecution(req, res, next) {
    try {
      const result = await executionService.pauseExecution(req.params.id, req.user.id);
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (err) {
      next(err);
    }
  }

  async resumeExecution(req, res, next) {
    try {
      const result = await executionService.resumeExecution(req.params.id, req.user.id);
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (err) {
      next(err);
    }
  }

  async cancelExecution(req, res, next) {
    try {
      const result = await executionService.cancelExecution(req.params.id, req.user.id);
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ExecutionController();
