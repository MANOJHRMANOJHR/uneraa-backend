import { Router } from 'express';
import { authorizeUser } from '../middleware/auth.middleware';
import userController from '../controllers/user.controller';

const userRouter: Router = Router();

userRouter.route("/getUsers").get(authorizeUser, userController.getUsers);

userRouter.route('/getUser/:id').get(authorizeUser, userController.getUserById);

userRouter
  .route('/updateUser')
  .patch(authorizeUser, userController.updateUserProfileData);

userRouter.route('/deleteUser').get(authorizeUser, userController.deleteUser);
