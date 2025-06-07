import { Router } from 'express';
import authController from '../controllers/auth.controllers';
import { upload } from '../middleware/multer.middleware';

const userRouter: Router = Router();

userRouter.route('/register').post(
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  authController.registerUser
);

export default userRouter;
