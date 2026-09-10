import { Router } from 'express';
import { UserController } from './user.controller.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { createUserSchema, updateUserSchema, userIdParamSchema } from './user.schema.js';

const router = Router();
const userController = new UserController();

router
  .route('/')
  .get(userController.getUsers)
  .post(validateRequest({ body: createUserSchema }), userController.createUser);

router
  .route('/:id')
  .get(validateRequest({ params: userIdParamSchema }), userController.getUserById)
  .patch(
    validateRequest({ params: userIdParamSchema, body: updateUserSchema }),
    userController.updateUser
  )
  .delete(validateRequest({ params: userIdParamSchema }), userController.deleteUser);

export const userRouter = router;
