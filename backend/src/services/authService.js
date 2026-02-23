import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../utils/tokenUtils.js';

class AuthService {
  async signup(data) {
    const { email, password, name, chronotype, soundSensitivity } = data;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create user (password will be hashed by pre-save middleware)
    const user = await User.create({
      email: email.toLowerCase().trim(),
      password,
      name: name.trim(),
      chronotype: chronotype || 'neutral',
      soundSensitivity: soundSensitivity !== undefined ? soundSensitivity : 5
    });

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    // Return user without password
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.refreshTokens;

    return { user: userObject, accessToken, refreshToken };
  }

  async login(data) {
    const { email, password } = data;

    // Find user with password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Manage refresh tokens (keep last 4)
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens = user.refreshTokens.slice(-4);
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    // Return user without password
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.refreshTokens;

    return { user: userObject, accessToken, refreshToken };
  }

  async refreshToken(token) {
    const user = await User.findOne({ 'refreshTokens.token': token });
    if (!user) {
      throw new Error('Invalid refresh token');
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Rotate refresh token
    user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== token);
    user.refreshTokens.push({ token: newRefreshToken });
    await user.save();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(token) {
    const user = await User.findOne({ 'refreshTokens.token': token });
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== token);
      await user.save();
    }
  }
}

export default new AuthService();
