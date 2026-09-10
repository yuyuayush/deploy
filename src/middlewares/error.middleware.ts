import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { HttpStatus } from '../constants/http-status.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

// Centralized error handling middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    return ApiResponse.error(
      res,
      'Validation Error',
      HttpStatus.UNPROCESSABLE_ENTITY,
      formattedErrors
    );
  }

  // Handle operational ApiErrors
  if (err instanceof ApiError) {
    if (!err.isOperational) {
      logger.error(err, `[UNOPERATIONAL ERROR] ${err.message}`);
    }

    return ApiResponse.error(res, err.message, err.statusCode, err.errors);
  }

  // Handle unexpected internal server errors
  logger.error(err, `[UNHANDLED ERROR] ${req.method} ${req.url} - ${err.message}`);

  const message =
    env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  return ApiResponse.error(res, message, HttpStatus.INTERNAL_SERVER_ERROR);
};

// 404 Handler for undefined routes
export const notFoundHandler = (req: Request, res: Response): Response => {
  return ApiResponse.error(
    res,
    `Route ${req.method} ${req.originalUrl} not found`,
    HttpStatus.NOT_FOUND
  );
};
