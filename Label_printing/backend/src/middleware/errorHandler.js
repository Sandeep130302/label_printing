// ============================================
// ERROR HANDLER MIDDLEWARE
// ============================================
// Catches all errors from routes/controllers
// Formats error responses consistently
// Sets appropriate HTTP status codes

export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Default error object
  let errorResponse = {
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An internal server error occurred'
  };

  // Set status code
  let statusCode = 500;

  // Handle different error types
  if (err.status) {
    statusCode = err.status;
    errorResponse.error = err.code || 'ERROR';
    errorResponse.message = err.message;
  } else if (err.code === '23505') {
    // PostgreSQL unique constraint violation
    statusCode = 409;
    errorResponse.error = 'DUPLICATE_ENTRY';
    errorResponse.message = 'This record already exists';
  } else if (err.code === '23503') {
    // PostgreSQL foreign key violation
    statusCode = 400;
    errorResponse.error = 'INVALID_REFERENCE';
    errorResponse.message = 'Referenced record does not exist';
  } else if (err.code === '22P02') {
    // PostgreSQL invalid UUID format
    statusCode = 400;
    errorResponse.error = 'INVALID_UUID';
    errorResponse.message = 'Invalid UUID format';
  } else if (err.message) {
    statusCode = 500;
    errorResponse.message = err.message;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
}

// ============================================
// NOT FOUND MIDDLEWARE
// ============================================
// Handles routes that don't exist

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`
  });
}

// ============================================
// ASYNC ERROR WRAPPER
// ============================================
// Wraps async route handlers to catch errors

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
