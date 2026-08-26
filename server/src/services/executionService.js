const db = require('../models/dbAdapter');
const { addExecutionJob } = require('../queues/executionQueue');
const orchestrator = require('../agents/orchestrator');

class ExecutionService {
  async triggerExecution(workflowId, userId, inputs = {}) {
    const workflow = await db.Workflow.findById(workflowId);
    if (!workflow) {
      const error = new Error('Workflow not found to execute');
      error.statusCode = 404;
      throw error;
    }

    if (!workflow.nodes || workflow.nodes.length === 0) {
      const error = new Error('Workflow has no nodes configured');
      error.statusCode = 400;
      throw error;
    }

    // Capture immutable runtime snapshot of workflow
    const workflowSnapshot = {
      _id: workflow._id,
      name: workflow.name,
      description: workflow.description,
      version: workflow.version,
      triggerConfig: workflow.triggerConfig,
      nodes: workflow.nodes,
      edges: workflow.edges
    };

    const execution = await db.Execution.create({
      workflowId: workflow._id,
      owner: userId,
      workflowSnapshot,
      status: 'PENDING',
      currentNode: null,
      startTime: new Date(),
      inputs,
      outputs: {},
      error: null,
      retryCount: 0
    });

    // Dispatch to background queue (BullMQ or in-memory)
    await addExecutionJob(execution._id);

    return execution;
  }

  async listExecutions(userId, query = {}) {
    const { status, workflowId, page = 1, limit = 50 } = query;
    const filter = { owner: userId };

    if (status) filter.status = status;
    if (workflowId) filter.workflowId = workflowId;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const executions = await db.Execution.find(filter, { startTime: -1 }, parseInt(limit, 10), skip);
    const total = await db.Execution.countDocuments(filter);

    return {
      executions,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / parseInt(limit, 10)) || 1
      }
    };
  }

  async getExecutionById(executionId, userId) {
    const execution = await db.Execution.findById(executionId);
    if (!execution) {
      const error = new Error('Execution not found');
      error.statusCode = 404;
      throw error;
    }
    return execution;
  }

  async getExecutionTimeline(executionId, userId) {
    const logs = await db.ExecutionLog.find(
      { executionId },
      { timestamp: 1 }
    );
    return logs;
  }

  async pauseExecution(executionId, userId) {
    const execution = await db.Execution.findById(executionId);
    if (!execution) {
      const error = new Error('Execution not found');
      error.statusCode = 404;
      throw error;
    }

    if (execution.status !== 'RUNNING') {
      const error = new Error(`Cannot pause execution with status ${execution.status}`);
      error.statusCode = 400;
      throw error;
    }

    orchestrator.setExecutionControl(executionId, 'PAUSED');
    return { success: true, message: 'Pause signal sent to orchestrator' };
  }

  async resumeExecution(executionId, userId) {
    const execution = await db.Execution.findById(executionId);
    if (!execution) {
      const error = new Error('Execution not found');
      error.statusCode = 404;
      throw error;
    }

    if (execution.status !== 'PAUSED') {
      const error = new Error(`Cannot resume execution with status ${execution.status}`);
      error.statusCode = 400;
      throw error;
    }

    orchestrator.setExecutionControl(executionId, 'RUNNING');
    // Re-queue or trigger orchestrator resume
    await addExecutionJob(execution._id);

    return { success: true, message: 'Execution resumed' };
  }

  async cancelExecution(executionId, userId) {
    const execution = await db.Execution.findById(executionId);
    if (!execution) {
      const error = new Error('Execution not found');
      error.statusCode = 404;
      throw error;
    }

    orchestrator.setExecutionControl(executionId, 'CANCELLED');
    await db.Execution.findByIdAndUpdate(executionId, {
      status: 'CANCELLED',
      endTime: new Date()
    });

    return { success: true, message: 'Execution cancelled' };
  }
}

module.exports = new ExecutionService();
