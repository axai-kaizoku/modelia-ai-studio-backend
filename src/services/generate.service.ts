import db from '@/db';
import { generations } from '@/db/schema';
import { ApiError } from '@/utils';
import { desc, eq } from 'drizzle-orm';
import httpStatus from 'http-status';

const simulateDelay = () => new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 1000));

const isModelOverloaded = () => Math.random() < 0.2;

const createGeneration = async (userId: string, payload: { prompt: string; style?: string; imageUpload?: string }) => {
  await simulateDelay();

  if (isModelOverloaded()) {
    throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Model overloaded');
  }

  const [generation] = await db
    .insert(generations)
    .values({
      userId,
      originalImage: payload.imageUpload,
      prompt: payload.prompt,
      style: payload.style,
      imageUrl: `https://picsum.photos/seed/${Date.now()}/800/600`,
      status: 'completed',
    })
    .returning();

  return generation;
};

const getGenerationsByUserId = async (userId: string, limit = 5) => {
  const userGenerations = await db
    .select()
    .from(generations)
    .where(eq(generations.userId, userId))
    .orderBy(desc(generations.createdAt))
    .limit(limit);

  return userGenerations;
};

export default {
  createGeneration,
  getGenerationsByUserId,
};
