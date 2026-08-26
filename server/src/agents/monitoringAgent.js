const db = require('../models/dbAdapter');
const { emitAgentEvent } = require('../config/socket');

/**
 * Monitoring Agent
 * Captures timeline events, persists them to ExecutionLog collection,
 * updates agent memory, and streams real-time updates over Socket.IO.
 */
class MonitoringAgent {
  constructor() {
    this.name = 'Monitoring Agent';
    this.id = 'monitoring';
  }

  async recordEvent(params) {
    const {
      executionId,
      workflowId,
      nodeId = null,
      agent,
      level = 'info',
      message,
      metadata = {}
    } = params;

    const logEntry = {
      executionId,
      workflowId,
      nodeId,
      agent,
      level,
      message,
      metadata,
      timestamp: new Date()
    };

    // 1. Persist log to DB
    const savedLog = await db.ExecutionLog.create(logEntry);

    // 2. Stream real-time event to Socket.IO room
    emitAgentEvent(executionId, {
      ...savedLog,
      id: savedLog._id || savedLog.id
    });

    return savedLog;
  }

  async persistMemory(workflowId, executionId, agentId, key, value, confidenceScore = 1.0) {
    return await db.AgentMemory.create({
      workflowId,
      executionId,
      agentId,
      key,
      value,
      confidenceScore
    });
  }
}

module.exports = new MonitoringAgent();
