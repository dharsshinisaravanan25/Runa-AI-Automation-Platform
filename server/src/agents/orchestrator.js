const plannerAgent = require('./plannerAgent');
const executionAgent = require('./executionAgent');
const validationAgent = require('./validationAgent');
const recoveryAgent = require('./recoveryAgent');
const monitoringAgent = require('./monitoringAgent');
const notificationService = require('../services/notificationService');
const db = require('../models/dbAdapter');
const { emitExecutionUpdate } = require('../config/socket');

// Detect LangGraph availability
let langGraphStatus = 'not-installed';
try {
  require.resolve('@langchain/langgraph');
  langGraphStatus = 'available';
} catch (e) {
  langGraphStatus = 'not-installed';
}

class MultiAgentOrchestrator {
  constructor() {
    this.activeRuns = new Map(); // executionId -> controlState ('RUNNING' | 'PAUSED' | 'CANCELLED')
  }

  getLangGraphStatus() {
    return langGraphStatus;
  }

  setExecutionControl(executionId, state) {
    this.activeRuns.set(executionId.toString(), state);
  }

  async runWorkflow(executionId, options = {}) {
    const execution = await db.Execution.findById(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found.`);
    }

    const workflow = execution.workflowSnapshot;
    const userId = execution.owner;
    const executionIdStr = executionId.toString();

    this.setExecutionControl(executionIdStr, 'RUNNING');

    // Update status to RUNNING
    await db.Execution.findByIdAndUpdate(executionId, {
      status: 'RUNNING',
      startTime: new Date()
    });

    emitExecutionUpdate(executionId, { status: 'RUNNING', startTime: new Date() });

    // Step 1: MONITORING AGENT - Start Run
    await monitoringAgent.recordEvent({
      executionId,
      workflowId: workflow._id || execution.workflowId,
      agent: 'monitoring',
      level: 'info',
      message: `🚀 Initiated Agentic Workflow Run "${workflow.name}"`,
      metadata: {
        langGraph: langGraphStatus,
        version: workflow.version || 1,
        nodeCount: (workflow.nodes || []).length
      }
    });

    // Step 2: PLANNER AGENT - Plan graph execution
    let plan;
    try {
      plan = await plannerAgent.plan(workflow);
      await monitoringAgent.recordEvent({
        executionId,
        workflowId: execution.workflowId,
        agent: 'planner',
        level: 'info',
        message: `🧠 Planner Agent formulated DAG execution sequence of ${plan.totalSteps} steps (Confidence: ${(plan.confidenceScore * 100).toFixed(0)}%)`,
        metadata: {
          sequence: plan.executionSequence.map(n => n.id),
          confidenceScore: plan.confidenceScore,
          strategy: 'topological_dag_traversal'
        }
      });
      await monitoringAgent.persistMemory(execution.workflowId, executionId, 'planner', 'execution_plan', plan, plan.confidenceScore);
    } catch (planError) {
      await monitoringAgent.recordEvent({
        executionId,
        workflowId: execution.workflowId,
        agent: 'planner',
        level: 'error',
        message: `❌ Planner Agent failed to resolve graph: ${planError.message}`
      });

      await this.finalizeExecution(executionId, 'FAILED', { error: planError.message });
      return;
    }

    // Step 3: EXECUTION LOOP
    const runtimeContext = {
      workflow: { id: workflow._id, name: workflow.name },
      trigger: execution.inputs || {},
      nodes: {}
    };

    let stepIndex = 0;
    const sequence = plan.executionSequence;

    for (const node of sequence) {
      stepIndex++;

      // Check for Pause / Cancel control signals
      const control = this.activeRuns.get(executionIdStr);
      if (control === 'CANCELLED') {
        await monitoringAgent.recordEvent({
          executionId,
          workflowId: execution.workflowId,
          nodeId: node.id,
          agent: 'monitoring',
          level: 'warning',
          message: `🛑 Execution cancelled by operator at node ${node.id} (${node.data?.label})`
        });
        await this.finalizeExecution(executionId, 'CANCELLED', { outputs: runtimeContext.nodes });
        return;
      }

      if (control === 'PAUSED') {
        await monitoringAgent.recordEvent({
          executionId,
          workflowId: execution.workflowId,
          nodeId: node.id,
          agent: 'monitoring',
          level: 'warning',
          message: `⏸️ Execution paused by operator at node ${node.id} (${node.data?.label})`
        });
        await db.Execution.findByIdAndUpdate(executionId, {
          status: 'PAUSED',
          currentNode: node.id,
          outputs: runtimeContext.nodes
        });
        emitExecutionUpdate(executionId, { status: 'PAUSED', currentNode: node.id });
        return;
      }

      // Update current node in progress
      await db.Execution.findByIdAndUpdate(executionId, { currentNode: node.id });
      emitExecutionUpdate(executionId, { currentNode: node.id });

      let nodeExecutedSuccessfully = false;
      let retryCount = 0;

      while (!nodeExecutedSuccessfully) {
        // EXECUTION AGENT
        await monitoringAgent.recordEvent({
          executionId,
          workflowId: execution.workflowId,
          nodeId: node.id,
          agent: 'execution',
          level: 'info',
          message: `⚡ Execution Agent running step ${stepIndex}/${sequence.length}: "${node.data?.label}" [${node.data?.provider || 'core'}:${node.data?.action || 'run'}]`,
          metadata: { provider: node.data?.provider, action: node.data?.action, retryCount }
        });

        const execResult = await executionAgent.executeNode(node, runtimeContext, userId);

        // VALIDATION AGENT
        const validation = await validationAgent.validate(execResult, node);

        if (validation.isValid) {
          nodeExecutedSuccessfully = true;
          runtimeContext.nodes[node.id] = {
            output: execResult.output,
            input: execResult.input,
            durationMs: execResult.durationMs
          };

          await monitoringAgent.recordEvent({
            executionId,
            workflowId: execution.workflowId,
            nodeId: node.id,
            agent: 'validation',
            level: 'success',
            message: `🛡️ Validation Agent verified step "${node.data?.label}" output integrity.`,
            metadata: { durationMs: execResult.durationMs, validationCheck: 'PASSED' }
          });

          await monitoringAgent.persistMemory(execution.workflowId, executionId, 'execution', `node_${node.id}_output`, execResult.output);
        } else {
          // RECOVERY AGENT
          const errorTaxonomy = recoveryAgent.classifyError(execResult.error, validation);
          const strategy = recoveryAgent.evaluateStrategy(errorTaxonomy, retryCount);

          await monitoringAgent.recordEvent({
            executionId,
            workflowId: execution.workflowId,
            nodeId: node.id,
            agent: 'recovery',
            level: strategy.decision === 'retry_with_backoff' ? 'warning' : 'error',
            message: `🩹 Recovery Agent: ${strategy.reason}`,
            metadata: {
              category: strategy.category,
              decision: strategy.decision,
              remediation: strategy.remediation,
              backoffMs: strategy.backoffMs
            }
          });

          if (strategy.decision === 'retry_with_backoff') {
            retryCount = strategy.nextRetryCount;
            await db.Execution.findByIdAndUpdate(executionId, {
              status: 'RETRYING',
              retryCount: (execution.retryCount || 0) + 1
            });
            emitExecutionUpdate(executionId, { status: 'RETRYING' });
            await new Promise(r => setTimeout(r, strategy.backoffMs));
          } else {
            // Escalate failure
            await this.finalizeExecution(executionId, 'FAILED', {
              error: {
                message: validation.errorDetails || execResult.error?.message,
                category: strategy.category,
                remediation: strategy.remediation,
                failedNodeId: node.id
              },
              outputs: runtimeContext.nodes
            });

            // Trigger notification
            await notificationService.createNotification({
              owner: userId,
              workflowId: execution.workflowId,
              executionId,
              type: 'error',
              title: `Execution Failed: ${workflow.name}`,
              message: `Step "${node.data?.label}" encountered ${strategy.category}: ${strategy.remediation}`
            });

            return;
          }
        }
      }
    }

    // Step 4: SUCCESSFUL COMPLETION
    await this.finalizeExecution(executionId, 'COMPLETED', {
      outputs: runtimeContext.nodes
    });

    await notificationService.createNotification({
      owner: userId,
      workflowId: execution.workflowId,
      executionId,
      type: 'success',
      title: `Execution Succeeded: ${workflow.name}`,
      message: `Completed all ${sequence.length} steps with 100% data validation.`
    });
  }

  async finalizeExecution(executionId, status, payload = {}) {
    const endTime = new Date();
    const execution = await db.Execution.findById(executionId);
    const duration = execution?.startTime ? (endTime.getTime() - new Date(execution.startTime).getTime()) : 0;

    const updated = await db.Execution.findByIdAndUpdate(executionId, {
      status,
      endTime,
      duration,
      currentNode: null,
      outputs: payload.outputs || execution?.outputs || {},
      error: payload.error || null
    });

    this.activeRuns.delete(executionId.toString());

    emitExecutionUpdate(executionId, {
      status,
      endTime,
      duration,
      currentNode: null,
      error: payload.error || null
    });

    await monitoringAgent.recordEvent({
      executionId,
      workflowId: execution?.workflowId,
      agent: 'monitoring',
      level: status === 'COMPLETED' ? 'success' : (status === 'CANCELLED' ? 'warning' : 'error'),
      message: `🏁 Run finished with status: ${status} in ${(duration / 1000).toFixed(2)}s`,
      metadata: { finalStatus: status, durationMs: duration }
    });

    return updated;
  }
}

module.exports = new MultiAgentOrchestrator();
