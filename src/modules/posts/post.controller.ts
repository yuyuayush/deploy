import { Request, Response, NextFunction } from 'express';
import { PostService } from './post.service.js';
import { ApiResponse } from '../../utils/api-response.js';

export class PostController {
  private postService: PostService;

  constructor() {
    this.postService = new PostService();
  }

  public getPosts = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const posts = await this.postService.getAllPosts();
      ApiResponse.success(res, posts, 'Posts retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public createPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const newPost = await this.postService.createPost(req.body);
      ApiResponse.created(res, newPost, 'Post created successfully');
    } catch (error) {
      next(error);
    }
  };

  public toggleLike = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const increment = req.body?.increment !== false;
      const likerName = req.body?.likerName;
      const likerEmail = req.body?.likerEmail;
      const updatedPost = await this.postService.toggleLike(req.params.id, increment, {
        name: likerName,
        email: likerEmail,
      });
      ApiResponse.success(res, updatedPost, 'Post like updated successfully');
    } catch (error) {
      next(error);
    }
  };
}
