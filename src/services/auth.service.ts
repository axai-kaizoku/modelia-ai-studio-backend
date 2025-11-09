import { tokenTypes } from '@/config/tokens';
import { ApiError } from '@/utils';
import { isPasswordMatch } from '@/utils/password-hash';
import httpStatus from 'http-status';
import tokenService from './token.service';
import userService from './user.service';

const loginUserWithEmailAndPassword = async (email: string, password: string) => {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await isPasswordMatch(password, user.password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return user;
};

const logout = async (refreshToken: string) => {
  try {
    const { user } = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);

    if (!user) {
      throw new Error('User not found for refresh token');
    }

    await tokenService.deleteToken(user.id, tokenTypes.REFRESH);
  } catch {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Logout failed');
  }
};

export default {
  loginUserWithEmailAndPassword,
  logout,
};
