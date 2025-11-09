import app from '@/app';
import db from '@/db';
import { users } from '@/db/schema';
import tokenService from '@/services/token.service';
import { hashPassword } from '@/utils/password-hash';
import { eq } from 'drizzle-orm';
import httpStatus from 'http-status';
import request from 'supertest';

describe('Validation and Error Handling', () => {
  let accessToken: string;

  beforeAll(async () => {
    await db.delete(users);

    const hashedPassword = await hashPassword('Password123!');
    const [user] = await db
      .insert(users)
      .values({
        name: 'Validation Test User',
        email: 'validation@example.com',
        password: hashedPassword,
        role: 'user',
      })
      .returning();

    const tokens = await tokenService.generateAuthTokens(user);
    accessToken = tokens.access.token;
  });

  afterAll(async () => {
    await db.delete(users);
  });

  describe('Error Response Structure', () => {
    it('should return consistent error structure for validation errors', async () => {
      const res = await request(app)
        .post('/v1/auth/register')
        .send({
          name: 'Test',
          email: 'invalid-email',
          password: 'weak',
        })
        .expect(httpStatus.BAD_REQUEST);

      expect(res.body).toHaveProperty('code');
      expect(res.body).toHaveProperty('message');
      expect(res.body.code).toBe(httpStatus.BAD_REQUEST);
      expect(typeof res.body.message).toBe('string');
    });

    it('should return consistent error structure for authentication errors', async () => {
      const res = await request(app)
        .post('/v1/generate')
        .send({ prompt: 'Test prompt for validation' })
        .expect(httpStatus.UNAUTHORIZED);

      expect(res.body).toHaveProperty('code');
      expect(res.body).toHaveProperty('message');
      expect(res.body.code).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should return consistent error structure for not found errors', async () => {
      const res = await request(app).get('/v1/nonexistent-endpoint').expect(httpStatus.NOT_FOUND);

      expect(res.body).toHaveProperty('code');
      expect(res.body).toHaveProperty('message');
      expect(res.body.code).toBe(httpStatus.NOT_FOUND);
    });

    it('should return consistent error structure for business logic errors', async () => {
      // Try to register with existing email
      const userData = {
        name: 'Test User',
        email: 'validation@example.com',
        password: 'Password123!',
        role: 'user',
      };

      const res = await request(app).post('/v1/auth/register').send(userData).expect(httpStatus.BAD_REQUEST);

      expect(res.body).toHaveProperty('code');
      expect(res.body).toHaveProperty('message');
      expect(res.body.code).toBe(httpStatus.BAD_REQUEST);
      expect(res.body.message).toBe('Email is already taken');
    });
  });

  describe('HTTP Status Codes', () => {
    it('should return 400 for invalid input data', async () => {
      await request(app)
        .post('/v1/auth/login')
        .send({ email: 'invalid', password: '123' })
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 401 for missing authentication', async () => {
      await request(app).post('/v1/generate').send({ prompt: 'Test prompt' }).expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 401 for invalid credentials', async () => {
      await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'validation@example.com',
          password: 'WrongPassword123!',
        })
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 404 for non-existent routes', async () => {
      await request(app).get('/v1/does-not-exist').expect(httpStatus.NOT_FOUND);
    });

    it('should return 201 for successful resource creation', async () => {
      await request(app)
        .post('/v1/generate')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ prompt: 'Test prompt for status code validation' })
        .expect(httpStatus.CREATED);
    });

    it('should return 200 for successful GET requests', async () => {
      await request(app).get('/v1/generate').set('Authorization', `Bearer ${accessToken}`).expect(httpStatus.OK);
    });
  });

  describe('Input Validation', () => {
    describe('Email Validation', () => {
      it('should reject invalid email formats', async () => {
        const invalidEmails = ['notanemail', '@example.com', 'user@', 'user @example.com'];

        for (const email of invalidEmails) {
          const res = await request(app)
            .post('/v1/auth/register')
            .send({
              name: 'Test',
              email,
              password: 'Password123!',
              role: 'user',
            })
            .expect(httpStatus.BAD_REQUEST);

          expect(res.body.code).toBe(httpStatus.BAD_REQUEST);
        }
      });

      it('should accept valid email formats', async () => {
        const validEmail = 'valid.email+test@example.com';
        await db.delete(users).where(eq(users.email, validEmail));

        const res = await request(app)
          .post('/v1/auth/register')
          .send({
            name: 'Test',
            email: validEmail,
            password: 'Password123!',
            role: 'user',
          })
          .expect(httpStatus.CREATED);

        expect(res.body.email).toBe(validEmail);
      });
    });

    describe('Password Validation', () => {
      it('should reject weak passwords', async () => {
        const weakPasswords = ['123', 'password', 'abc'];

        for (const password of weakPasswords) {
          await request(app)
            .post('/v1/auth/register')
            .send({
              name: 'Test',
              email: 'test@example.com',
              password,
              role: 'user',
            })
            .expect(httpStatus.BAD_REQUEST);
        }
      });
    });

    describe('Prompt Validation', () => {
      it('should reject prompts that are too short', async () => {
        const res = await request(app)
          .post('/v1/generate')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ prompt: 'short' })
          .expect(httpStatus.BAD_REQUEST);

        expect(res.body.code).toBe(httpStatus.BAD_REQUEST);
      });

      it('should reject prompts that are too long', async () => {
        const longPrompt = 'a'.repeat(1001);
        const res = await request(app)
          .post('/v1/generate')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ prompt: longPrompt })
          .expect(httpStatus.BAD_REQUEST);

        expect(res.body.code).toBe(httpStatus.BAD_REQUEST);
      });

      it('should accept valid prompts', async () => {
        const validPrompt = 'This is a valid prompt for image generation';
        const res = await request(app)
          .post('/v1/generate')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ prompt: validPrompt })
          .expect(httpStatus.CREATED);

        expect(res.body.prompt).toBe(validPrompt);
      });
    });

    describe('Image Upload Validation', () => {
      it('should reject invalid base64 format', async () => {
        const res = await request(app)
          .post('/v1/generate')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            prompt: 'Test prompt with invalid image',
            imageUpload: 'not-a-valid-base64-image',
          })
          .expect(httpStatus.BAD_REQUEST);

        expect(res.body.code).toBe(httpStatus.BAD_REQUEST);
      });

      it('should accept valid base64 image', async () => {
        const validBase64 =
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        const res = await request(app)
          .post('/v1/generate')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            prompt: 'Test prompt with valid image',
            imageUpload: validBase64,
          })
          .expect(httpStatus.CREATED);

        expect(res.body.originalImage).toBe(validBase64);
      });
    });
  });

  describe('Missing Required Fields', () => {
    it('should reject registration without required fields', async () => {
      const incompleteData = [
        { email: 'test@example.com', password: 'Password123!', role: 'user' }, // missing name
        { name: 'Test', password: 'Password123!', role: 'user' }, // missing email
        { name: 'Test', email: 'test@example.com', role: 'user' }, // missing password
      ];

      for (const data of incompleteData) {
        const res = await request(app).post('/v1/auth/register').send(data).expect(httpStatus.BAD_REQUEST);

        expect(res.body.code).toBe(httpStatus.BAD_REQUEST);
      }
    });

    it('should reject login without required fields', async () => {
      await request(app).post('/v1/auth/login').send({ email: 'test@example.com' }).expect(httpStatus.BAD_REQUEST);

      await request(app).post('/v1/auth/login').send({ password: 'Password123!' }).expect(httpStatus.BAD_REQUEST);
    });

    it('should reject generation without prompt', async () => {
      const res = await request(app)
        .post('/v1/generate')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ style: 'realistic' })
        .expect(httpStatus.BAD_REQUEST);

      expect(res.body.code).toBe(httpStatus.BAD_REQUEST);
    });
  });
});
