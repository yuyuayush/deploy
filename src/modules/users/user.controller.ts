import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service.js';
import { ApiResponse } from '../../utils/api-response.js';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public getUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      ApiResponse.success(res, users, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = await this.userService.getUserById(req.params.id);
      ApiResponse.success(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const newUser = await this.userService.createUser(req.body);
      ApiResponse.created(res, newUser, 'User created successfully');
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const updatedUser = await this.userService.updateUser(req.params.id, req.body);
      ApiResponse.success(res, updatedUser, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.userService.deleteUser(req.params.id);
      ApiResponse.noContent(res);
    } catch (error) {
      next(error);
    }
  };
}
