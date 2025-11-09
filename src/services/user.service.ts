import db from '@/db';
import { users } from '@/db/schema';
import type { UserPayload } from '@/types';
import { ApiError } from '@/utils';
import { hashPassword } from '@/utils/password-hash';
import { eq, getTableColumns } from 'drizzle-orm';
import httpStatus from 'http-status';

export const getUserByEmail = async (email: string) => {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1).execute();
  return user || null;
};

export const createUser = async (data: UserPayload) => {
  const existingUser = await getUserByEmail(data.email);

  if (existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email is already taken');
  }

  const hashedPassword = await hashPassword(data.password);
  const payload = {
    ...data,
    password: hashedPassword,
  };

  const [user] = await db.insert(users).values(payload).returning();
  const { password, ...rest } = user;

  return rest;
};

export const getUserById = async (id: string) => {
  const { password, ...rest } = getTableColumns(users);
  const [user] = await db.select(rest).from(users).where(eq(users.id, id));

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user;
};

export default {
  getUserByEmail,
  createUser,
  getUserById,
};
