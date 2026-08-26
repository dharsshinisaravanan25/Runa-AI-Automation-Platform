/**
 * Recovery Agent
 * Analyzes step failures, classifies root causes into standard taxonomy:
 * - MISSING_FIELDS
 * - API_FAILURE
 * - AUTH_EXPIRED
 * - RATE_LIMIT
 * - TRANSIENT
 *
 * Decides strategy: 'retry_with_backoff' vs 'escalate'.
 */
class RecoveryAgent {
  constructor() {
    this.name = 'Recovery Agent';
    this.id = 'recovery';
    this.maxRetries = 3;
  }

  classifyError(error, validationResult) {
    const errorMsg = (error?.message || validationResult?.errorDetails || '').toLowerCase();
    const statusCode = error?.statusCode || error?.status || 0;

    if (validationResult?.reason === 'MISSING_FIELDS' || errorMsg.includes('missing required')) {
      return {
        category: 'MISSING_FIELDS',
        recoverable: false,
        remediation: 'Verify upstream node output mappings and ensure required fields are provided.'
      };
    }

    if (errorMsg.includes('auth') || errorMsg.includes('token') || errorMsg.includes('unauthorized') || statusCode === 401 || statusCode === 403) {
      return {
        category: 'AUTH_EXPIRED',
        recoverable: false,
        remediation: 'Integration credentials have expired or are missing. Please reconnect on the Integrations page.'
      };
    }

    if (errorMsg.includes('rate limit') || errorMsg.includes('too many requests') || statusCode === 429) {
      return {
        category: 'RATE_LIMIT',
        recoverable: true,
        remediation: 'Provider rate limit exceeded. Applying exponential backoff delay before retry.'
      };
    }

    if (errorMsg.includes('timeout') || errorMsg.includes('econnreset') || errorMsg.includes('network') || statusCode >= 500) {
      return {
        category: 'TRANSIENT',
        recoverable: true,
        remediation: 'Transient network glitch or server timeout. Automatic retry with backoff initiated.'
      };
    }

    return {
      category: 'API_FAILURE',
      recoverable: false,
      remediation: 'Third-party API returned an unrecoverable client error. Review parameters or configuration.'
    };
  }

  evaluateStrategy(errorClassification, currentRetryCount = 0) {
    const { category, recoverable, remediation } = errorClassification;

    if (recoverable && currentRetryCount < this.maxRetries) {
      // Exponential backoff: 1s, 2s, 4s (+ jitter)
      const backoffMs = Math.pow(2, currentRetryCount) * 1000 + Math.floor(Math.random() * 300);
      return {
        decision: 'retry_with_backoff',
        backoffMs,
        nextRetryCount: currentRetryCount + 1,
        category,
        remediation,
        reason: `Failure classified as ${category}. Retrying in ${backoffMs}ms (Attempt ${currentRetryCount + 1}/${this.maxRetries}).`
      };
    }

    return {
      decision: 'escalate',
      category,
      remediation,
      nextRetryCount: currentRetryCount,
      reason: `Failure classified as ${category}. Escalating execution error to operator.`
    };
  }
}

module.exports = new RecoveryAgent();
