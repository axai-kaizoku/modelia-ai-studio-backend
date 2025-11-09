import { z } from 'zod';

const createGeneration = {
  body: z.object({
    prompt: z.string().min(1).max(1000),
    style: z.string().max(100).optional(),
    imageUpload: z.string().optional(),
  }),
};

const getGenerations = {
  query: z.object({
    limit: z.string().optional().default('5'),
  }),
};

export default {
  createGeneration,
  getGenerations,
};
