import generateController from '@/controllers/generate.controller';
import auth from '@/middlewares/auth';
import validate from '@/middlewares/validate';
import generateValidation from '@/validations/generate.validation';
import express from 'express';

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(generateValidation.createGeneration), generateController.createGeneration)
  .get(auth(), validate(generateValidation.getGenerations), generateController.getGenerations);

export default router;
