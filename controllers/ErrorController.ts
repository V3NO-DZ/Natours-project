const AppError = require('../utils/appError');
import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from 'express';

/**
 * Handle Mongoose CastError (invalid MongoDB ObjectId or wrong field type)
 * Example: /api/v1/tours/invalid-id
 */
const handleCastErrorDB = (err: any): AppError => {
  const message = `Invalid ${err.path}: ${String(err.value)}.`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose Duplicate Fields Error
 * Example: trying to create a user with an email that already exists
 */
const handleDuplicateFieldsDB = (err: any): AppError => {
  // Prefer `keyValue` from Mongoose 5.9+
  const value = err.keyValue
    ? JSON.stringify(err.keyValue)
    : err.errmsg && err.errmsg.match(/(["'])(\\?.)*?\1/)
      ? err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
      : '';

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose Validation Errors
 * Example: missing required fields or invalid format
 */
const handleValidationErrorDB = (err: any): AppError => {
  const errors = Object.values(err.errors || {}).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handle invalid JWT token
 */
const handleJWTError = (): AppError =>
  new AppError('Invalid token. Please log in again!', 401); // 401 = Unauthorized

/**
 * Development error handler
 * - Returns full error details for easier debugging
 * - JSON for API routes, Pug template for rendered website routes
 */
const sendErrorDev = (err: any, req: Request, res: Response) => {
  if (req.originalUrl.startsWith('/api')) {
    // API response
    res.status(err.statusCode || 500).json({
      status: err.status || 'error',
      error: err,
      message: err.message || 'Internal Server Error',
      stack: err.stack,
    });
  } else {
    // Rendered website
    res.status(err.statusCode || 500).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
};

/**
 * Production error handler
 * - Sends operational errors to the client
 * - Sends generic message for programming/unknown errors
 */
const sendErrorProd = (err: any, req: Request, res: Response) => {
  // API route
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      // Operational, trusted error
      return res.status(err.statusCode || 500).json({
        status: err.status || 'error',
        message: err.message || 'Internal Server Error',
      });
    }
    // Programming or unknown error
    console.error('ERROR 💥', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }

  // Rendered website route
  if (err.isOperational) {
    // Operational, trusted error
    res.status(err.statusCode || 500).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  } else {
    // Programming or unknown error
    console.error('ERROR 💥', err);
    res.status(err.statusCode || 500).render('error', {
      title: 'Something went wrong',
      msg: 'Please try again later',
    });
  }
};

/**
 * Global error handling middleware
 * - Detects environment (dev/prod)
 * - Transforms known errors into operational ones
 * - Sends response using correct format (API JSON or rendered HTML)
 */
const globalErrorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('ERROR 💥', err);

  // Ensure defaults
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  const env = process.env.NODE_ENV || 'development';

  if (env === 'development') {
    return sendErrorDev(err, req, res);
  }

  // In production: make a shallow copy to avoid mutating original error
  let error: any = { ...err };
  error.message = err.message;
  error.name = err.name;

  // Transform known errors into operational AppErrors
  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();

  return sendErrorProd(error, req, res);
};

module.exports = globalErrorHandler;
