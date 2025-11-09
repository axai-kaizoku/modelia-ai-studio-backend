import { rolesAllowed } from '@/config';
import { z } from 'zod';
import { isPassword } from './custom.validation';

const createUser = {
  body: z.object({
    email: z.string().email(),
    password: isPassword,
    name: z.string(),
    role: z.enum(rolesAllowed),
  }),
};

const getUser = {
  params: z.object({
    userId: z.string().uuid(),
  }),
};

const updateUser = {
  params: z.object({
    userId: z.string().uuid(),
  }),
  body: z
    .object({
      email: z.string().email().optional(),
      password: isPassword.optional(),
      name: z.string().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
};

const deleteUser = {
  params: z.object({
    userId: z.string().uuid(),
  }),
};

export default {
  createUser,
  getUser,
  updateUser,
  deleteUser,
};
