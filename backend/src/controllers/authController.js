import authService from '../services/authService.js';
import { setAuthTokens } from '../utils/tokenUtils.js';
import { verifyRefreshToken } from '../utils/tokenUtils.js';
import ExpressError from '../middlewares/expressError.js';

export const signup = async (req, res) => {
  const result = await authService.signup(req.body);
  
  // Set tokens in cookies
  setAuthTokens(res, result.accessToken, result.refreshToken);
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken
  });
};

export const login = async (req, res) => {
  const result = await authService.login(req.body);
  
  // Set tokens in cookies
  setAuthTokens(res, result.accessToken, result.refreshToken);
  
  res.status(200).json({
    success: true,
    message: 'Login successful',
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken
  });
};

export const refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  
  if (!token) {
    throw new ExpressError(401, 'Refresh token required');
  }

  // Verify refresh token
  verifyRefreshToken(token);
  
  const result = await authService.refreshToken(token);
  
  // Set new tokens in cookies
  setAuthTokens(res, result.accessToken, result.refreshToken);
  
  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    accessToken: result.accessToken,
    refreshToken: result.refreshToken
  });
};

export const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  
  if (refreshToken) {
    await authService.logout(refreshToken);
  }
  
  // Clear cookies
  res.clearCookie('accessToken', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });
  
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      _id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      chronotype: req.user.chronotype,
      soundSensitivity: req.user.soundSensitivity,
      createdAt: req.user.createdAt
    }
  });
};
