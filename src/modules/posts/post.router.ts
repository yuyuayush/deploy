import { Router } from 'express';
import { PostController } from './post.controller.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { createPostSchema, postIdParamSchema } from './post.schema.js';

const router = Router();
const postController = new PostController();

router
  .route('/')
  .get(postController.getPosts)
  .post(validateRequest({ body: createPostSchema }), postController.createPost);

router
  .route('/:id/like')
  .post(validateRequest({ params: postIdParamSchema }), postController.toggleLike);

export const postRouter = router;
