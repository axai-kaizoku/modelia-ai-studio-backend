import generateService from '@/services/generate.service';
import type { AuthedReq } from '@/types';
import type { RequestHandler } from 'express';
import httpStatus from 'http-status';

const createGeneration: RequestHandler = async (req, res) => {
  const userId = (req as AuthedReq).user.id;
  const generation = await generateService.createGeneration(userId, req.body);
  res.status(httpStatus.CREATED).send(generation);
};

const getGenerations: RequestHandler = async (req, res) => {
  const userId = (req as AuthedReq).user.id;
  const limit = Number.parseInt(req.query.limit as string) || 5;
  const generations = await generateService.getGenerationsByUserId(userId, limit);
  res.status(httpStatus.OK).send(generations);
};

export default {
  createGeneration,
  getGenerations,
};
