import authService from '@/services/auth.service';
import tokenService from '@/services/token.service';
import userService from '@/services/user.service';
import type { LoginBody, RegisterBody } from '@/types/validation.types';
import type { RequestHandler } from 'express';
import httpStatus from 'http-status';

const register: RequestHandler = async (req, res) => {
  const payload = req.body as RegisterBody;
  const user = await userService.createUser(payload);
  res.status(httpStatus.CREATED).send(user);
};

const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body as LoginBody;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const token = await tokenService.generateAuthTokens(user);
  res.send({ user, token });
};

const logout: RequestHandler = async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.OK).send({ success: true, message: 'User logout successfully!' });
};

export default {
  register,
  logout,
  login,
};
