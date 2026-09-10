import { Request, Response } from 'express';
import { ApiResponse } from '../../utils/api-response.js';

export class HealthController {
  public static getHealth(_req: Request, res: Response): Response {
    const healthData = {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };

    return ApiResponse.success(res, healthData, 'Server is healthy');
  }
}
