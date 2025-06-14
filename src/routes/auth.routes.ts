import { Router, Request, Response } from 'express';
import authController from '../controllers/auth.controllers';
import { upload } from '../middleware/multer.middleware';
import passport from '../config/passport';
import { generateToken } from '../utils/jwt-token';
import { StatusCode } from '../constants/statusCode';
import ApiResponse from '../utils/api-response';

const authRouter: Router = Router();

authRouter.route('/register').post(
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  authController.registerUser
);

//google auth route
authRouter
  .route('/google')
  .get(passport.authenticate('google', { scope: ['profile', 'email'] }));
authRouter.route('/google/callback').get(
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login',
  }),
  handleOAuthCallback
);

//github auth route
authRouter
  .route('/github')
  .get(passport.authenticate('github', { scope: ['user:email'] }));
authRouter.route('/github/callback').get(
  passport.authenticate('github', {
    session: false,
    failureRedirect: '/login',
  }),
  handleOAuthCallback
);

authRouter
  .route('/discord')
  .get(passport.authenticate('discord', { scope: ['identify', 'email'] }));
authRouter.route('/discord/callback').get(
  passport.authenticate('discord', {
    session: false,
    failureRedirect: '/login',
  }),
  handleOAuthCallback
);

authRouter.route("/login").post(authController.loginUser);

function handleOAuthCallback(req: Request, res: Response) {
  console.log('user in callback', req.user);
  const user = req.user!;

  const token = generateToken(user);

  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  });
  res.status(StatusCode.OK).json(
    new ApiResponse(StatusCode.OK, true, 'Authentication successful', {
      token,
    })
  );
  return;
}

export default authRouter;
