import { Response } from 'express';
import { HttpStatusCode, HttpStatus } from '../constants/http-status.js';

export interface ApiResponsePayload<T> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
  errors?: unknown[];
}

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode: HttpStatusCode = HttpStatus.OK,
    meta?: Record<string, unknown>
  ): Response {
    const payload: ApiResponsePayload<T> = {
      success: true,
      message,
      data,
      ...(meta && { meta }),
    };

    return res.status(statusCode).json(payload);
  }

  static created<T>(res: Response, data: T, message = 'Resource created successfully'): Response {
    return ApiResponse.success(res, data, message, HttpStatus.CREATED);
  }

  static noContent(res: Response): Response {
    return res.status(HttpStatus.NO_CONTENT).send();
  }

  static error(
    res: Response,
    message = 'An error occurred',
    statusCode: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    errors?: unknown[]
  ): Response {
    const payload: ApiResponsePayload<null> = {
      success: false,
      message,
      ...(errors && { errors }),
    };

    return res.status(statusCode).json(payload);
  }
}
