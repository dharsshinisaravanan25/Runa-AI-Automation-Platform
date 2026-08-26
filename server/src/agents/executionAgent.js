const integrationService = require('../services/integrationService');

/**
 * Execution Agent
 * Interpolates variables from runtime memory, resolves dynamic templates,
 * and executes node actions against third-party integrations or AI providers.
 */
class ExecutionAgent {
  constructor() {
    this.name = 'Execution Agent';
    this.id = 'execution';
  }

  interpolateVariables(template, runtimeContext) {
    if (typeof template === 'string') {
      return template.replace(/\{\{([^}]+)\}\}/g, (match, pathStr) => {
        const cleanPath = pathStr.trim();
        const parts = cleanPath.split('.');
        let curr = runtimeContext;
        for (const part of parts) {
          if (curr && curr[part] !== undefined) {
            curr = curr[part];
          } else {
            return match; // Keep unresolved template or return fallback
          }
        }
        return typeof curr === 'object' ? JSON.stringify(curr) : String(curr);
      });
    }

    if (Array.isArray(template)) {
      return template.map(item => this.interpolateVariables(item, runtimeContext));
    }

    if (typeof template === 'object' && template !== null) {
      const resolved = {};
      for (const key of Object.keys(template)) {
        resolved[key] = this.interpolateVariables(template[key], runtimeContext);
      }
      return resolved;
    }

    return template;
  }

  async executeNode(node, runtimeContext, userId) {
    const startTime = Date.now();
    const data = node.data || {};
    const provider = data.provider || 'ai';
    const action = data.action || 'ai_process';
    const rawConfig = data.config || {};

    // 1. Resolve variable substitutions against runtime memory
    const resolvedConfig = this.interpolateVariables(rawConfig, runtimeContext);

    let output = null;
    try {
      // 2. Delegate to Integration Service
      output = await integrationService.executeNodeAction(userId, provider, action, {
        ...resolvedConfig,
        inputData: runtimeContext
      });

      const durationMs = Date.now() - startTime;

      return {
        success: true,
        nodeId: node.id,
        provider,
        action,
        input: resolvedConfig,
        output,
        durationMs
      };
    } catch (err) {
      const durationMs = Date.now() - startTime;
      return {
        success: false,
        nodeId: node.id,
        provider,
        action,
        input: resolvedConfig,
        error: {
          message: err.message,
          code: err.code || 'EXECUTION_ERROR',
          stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        },
        durationMs
      };
    }
  }
}

module.exports = new ExecutionAgent();
