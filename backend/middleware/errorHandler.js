// backend/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('Error caught by error handler:', err);

  // Default error
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Supabase errors
  if (err.code && typeof err.code === 'string') {
    switch (err.code) {
      case '23505': // unique_violation
        error = { message: 'Duplicate entry', statusCode: 400 };
        break;
      case '23503': // foreign_key_violation
        error = { message: 'Invalid reference', statusCode: 400 };
        break;
      case '42P01': // undefined_table
        error = { message: 'Database table not found', statusCode: 500 };
        break;
      case 'PGRST116': // No rows found
        error = { message: 'Resource not found', statusCode: 404 };
        break;
      default:
        error = { message: 'Database error', statusCode: 500 };
    }
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;