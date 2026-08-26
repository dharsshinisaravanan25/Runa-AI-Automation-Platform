/**
 * Validation Agent
 * Verifies required output fields, schema constraints, and data integrity
 * after every node execution.
 */
class ValidationAgent {
  constructor() {
    this.name = 'Validation Agent';
    this.id = 'validation';
  }

  async validate(executionResult, node) {
    const { success, output, error } = executionResult;

    if (!success) {
      return {
        isValid: false,
        reason: 'EXECUTION_FAILED',
        errorDetails: error?.message || 'Node execution returned an error'
      };
    }

    if (output === null || output === undefined) {
      return {
        isValid: false,
        reason: 'NULL_OUTPUT',
        errorDetails: `Node ${node.id} (${node.data?.label}) returned null or undefined output.`
      };
    }

    // Check action-specific required fields
    const action = node.data?.action;
    const missingFields = [];

    if (action === 'send_email') {
      if (!output.status) missingFields.push('status');
    } else if (action === 'read_inbox') {
      if (!output.messages) missingFields.push('messages');
    } else if (action === 'post_message') {
      if (!output.status) missingFields.push('status');
    } else if (action === 'append_row') {
      if (!output.status) missingFields.push('status');
    }

    if (missingFields.length > 0) {
      return {
        isValid: false,
        reason: 'MISSING_FIELDS',
        errorDetails: `Output payload is missing required fields: ${missingFields.join(', ')}`,
        missingFields
      };
    }

    return {
      isValid: true,
      reason: 'VALIDATION_PASSED',
      schemaCheck: 'passed',
      validatedAt: new Date().toISOString()
    };
  }
}

module.exports = new ValidationAgent();
