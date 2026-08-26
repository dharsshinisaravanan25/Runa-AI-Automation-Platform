const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errorCode = err.code || 'INTERNAL_ERROR';

  // Specific error classification
  if (err.message && err.message.includes('INTEGRATION_NOT_CONNECTED')) {
    statusCode = 400;
    errorCode = 'INTEGRATION_NOT_CONNECTED';
  } else if (err.message && err.message.includes('AUTH_EXPIRED')) {
    statusCode = 401;
    errorCode = 'AUTH_EXPIRED';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = Object.values(err.errors).map(val => val.message).join(', ');
  } else if (err.code === 11000) {
    statusCode = 400;
    errorCode = 'DUPLICATE_KEY';
    message = 'A resource with this identifier already exists.';
  }

  // Security: Never leak stack traces in production
  const response = {
    success: false,
    error: {
      code: errorCode,
      message
    }
  };

  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    response.error.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

module.exports = errorHandler;
