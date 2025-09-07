import { Router } from 'express';
import passport from '../config/passport.js';
import { generateToken } from '../utils/jwt-token.js';
const authRouter = Router();
const secureEnvironment = process.env.ENVIRONMENT !== 'development';
const frontendRedirectUrl = process.env.FRONTEND_REDIRECT_URL || 'http://localhost:3000/@me';
authRouter
    .route('/google')
    .get(passport.authenticate('google', { scope: ['profile', 'email'] }));
authRouter.route('/google/callback').get(passport.authenticate('google', {
    session: false,
    failureRedirect: '/login',
}), handleOAuthCallback);
authRouter
    .route('/github')
    .get(passport.authenticate('github', { scope: ['user:email'] }));
authRouter.route('/github/callback').get(passport.authenticate('github', {
    session: false,
    failureRedirect: '/login',
}), handleOAuthCallback);
authRouter
    .route('/discord')
    .get(passport.authenticate('discord', { scope: ['identify', 'email'] }));
authRouter.route('/discord/callback').get(passport.authenticate('discord', {
    session: false,
    failureRedirect: '/login',
}), handleOAuthCallback);
function handleOAuthCallback(req, res) {
    const user = req.user;
    const token = generateToken(user);
    res.cookie('auth_token', token, {
        httpOnly: true,
        secure: secureEnvironment,
        sameSite: 'strict',
    });
    res.redirect(frontendRedirectUrl);
}
export default authRouter;
