import authService from '../services/authService.js';
import { setAuthTokens } from '../utils/tokenUtils.js';
import { verifyRefreshToken } from '../utils/tokenUtils.js';

export const signup = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token required'
      });
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
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired refresh token'
    });
  }
};

export const logout = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const getMe = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
