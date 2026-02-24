import express from 'express';
import { signup, login, refreshToken, logout, getMe } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validateSignup, validateLogin } from '../validations/authValidation.js';
import wrapAsync from '../middlewares/wrapAsync.js';

const router = express.Router();

// Public routes
router.post('/signup', validateSignup, wrapAsync(signup));
router.post('/login', validateLogin, wrapAsync(login));
router.post('/refresh', wrapAsync(refreshToken));

// Protected routes
router.post('/logout', protect, wrapAsync(logout));
router.get('/me', protect, wrapAsync(getMe));

export default router;
