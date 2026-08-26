const db = require('../models/dbAdapter');

class WorkflowService {
  async createWorkflow(userId, data) {
    const {
      name,
      description = '',
      status = 'draft',
      triggerConfig = { type: 'manual' },
      nodes = [],
      edges = [],
      tags = []
    } = data;

    const workflow = await db.Workflow.create({
      name,
      description,
      owner: userId,
      status,
      triggerConfig,
      nodes,
      edges,
      version: 1,
      tags
    });

    return workflow;
  }

  async listWorkflows(userId, query = {}) {
    const { search, tag, status, page = 1, limit = 50 } = query;
    const filter = { owner: userId };

    if (status) {
      filter.status = status;
    }
    if (tag) {
      filter.tags = { $in: [tag] };
    }
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const workflows = await db.Workflow.find(filter, { updatedAt: -1 }, parseInt(limit, 10), skip);
    const total = await db.Workflow.countDocuments(filter);

    return {
      workflows,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / parseInt(limit, 10)) || 1
      }
    };
  }

  async getWorkflowById(workflowId, userId) {
    const workflow = await db.Workflow.findById(workflowId);
    if (!workflow) {
      const error = new Error('Workflow not found');
      error.statusCode = 404;
      throw error;
    }
    return workflow;
  }

  async updateWorkflow(workflowId, userId, updateData) {
    const existing = await db.Workflow.findById(workflowId);
    if (!existing) {
      const error = new Error('Workflow not found');
      error.statusCode = 404;
      throw error;
    }

    // Increment version if nodes or edges changed
    const isVersionBump = updateData.nodes || updateData.edges || updateData.triggerConfig;
    const nextVersion = isVersionBump ? (existing.version || 1) + 1 : (existing.version || 1);

    const updated = await db.Workflow.findByIdAndUpdate(workflowId, {
      ...updateData,
      version: nextVersion,
      updatedAt: new Date()
    });

    return updated;
  }

  async duplicateWorkflow(workflowId, userId) {
    const original = await db.Workflow.findById(workflowId);
    if (!original) {
      const error = new Error('Original workflow not found to duplicate');
      error.statusCode = 404;
      throw error;
    }

    const cloned = await db.Workflow.create({
      name: `${original.name} (Copy)`,
      description: original.description,
      owner: userId,
      status: 'draft',
      triggerConfig: original.triggerConfig,
      nodes: original.nodes,
      edges: original.edges,
      version: 1,
      tags: original.tags
    });

    return cloned;
  }

  async deleteWorkflow(workflowId, userId) {
    const existing = await db.Workflow.findById(workflowId);
    if (!existing) {
      const error = new Error('Workflow not found');
      error.statusCode = 404;
      throw error;
    }

    await db.Workflow.findByIdAndDelete(workflowId);
    // Cleanup related execution logs
    await db.Execution.deleteMany({ workflowId });
    await db.ExecutionLog.deleteMany({ workflowId });

    return { success: true, message: 'Workflow and related execution history removed.' };
  }

  async getDashboardMetrics(userId) {
    const totalWorkflows = await db.Workflow.countDocuments({ owner: userId });
    const activeWorkflows = await db.Workflow.countDocuments({ owner: userId, status: 'active' });
    const draftWorkflows = await db.Workflow.countDocuments({ owner: userId, status: 'draft' });

    const totalExecutions = await db.Execution.countDocuments({ owner: userId });
    const successfulExecutions = await db.Execution.countDocuments({ owner: userId, status: 'COMPLETED' });
    const failedExecutions = await db.Execution.countDocuments({ owner: userId, status: 'FAILED' });
    const runningExecutions = await db.Execution.countDocuments({ owner: userId, status: 'RUNNING' });

    const successRate = totalExecutions > 0 
      ? Math.round((successfulExecutions / totalExecutions) * 100) 
      : 100;

    const recentExecutions = await db.Execution.find({ owner: userId }, { startTime: -1 }, 8);
    const recentWorkflows = await db.Workflow.find({ owner: userId }, { updatedAt: -1 }, 4);

    return {
      metrics: {
        totalWorkflows,
        activeWorkflows,
        draftWorkflows,
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        runningExecutions,
        successRate,
        activeAgents: 5 // Planner, Execution, Validation, Recovery, Monitoring
      },
      recentExecutions,
      recentWorkflows
    };
  }
}

module.exports = new WorkflowService();
