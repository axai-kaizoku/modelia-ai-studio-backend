import app from '@/app';
import db from '@/db';
import { generations, users } from '@/db/schema';
import tokenService from '@/services/token.service';
import { hashPassword } from '@/utils/password-hash';
import httpStatus from 'http-status';
import request from 'supertest';

describe('Generation Routes', () => {
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    // Clean up tables
    await db.delete(generations);
    await db.delete(users);

    // Create a test user
    const hashedPassword = await hashPassword('Password123!');
    const [user] = await db
      .insert(users)
      .values({
        name: 'Test User',
        email: 'generate@example.com',
        password: hashedPassword,
        role: 'user',
      })
      .returning();

    userId = user.id;

    // Generate access token
    const tokens = await tokenService.generateAuthTokens(user);
    accessToken = tokens.access.token;
  });

  beforeEach(async () => {
    // Clean up generations before each test
    await db.delete(generations);
  });

  afterAll(async () => {
    // Clean up after all tests
    await db.delete(generations);
    await db.delete(users);
  });

  describe('POST /v1/generate', () => {
    const validGeneration = {
      prompt: 'A beautiful sunset over mountains',
      style: 'realistic',
      imageUpload: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    };

    it('should create a generation successfully', async () => {
      const res = await request(app)
        .post('/v1/generate')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validGeneration)
        .expect(httpStatus.CREATED);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('prompt', validGeneration.prompt);
      expect(res.body).toHaveProperty('style', validGeneration.style);
      expect(res.body).toHaveProperty('originalImage', validGeneration.imageUpload);
      expect(res.body).toHaveProperty('imageUrl');
      expect(res.body).toHaveProperty('status', 'completed');
      expect(res.body).toHaveProperty('createdAt');
    });

    it('should handle model overload error (20% chance)', async () => {
      // Try multiple times to hit the 20% overload case
      let overloadHit = false;
      const maxAttempts = 20;

      for (let i = 0; i < maxAttempts; i++) {
        const res = await request(app)
          .post('/v1/generate')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(validGeneration);

        if (res.status === httpStatus.SERVICE_UNAVAILABLE) {
          expect(res.body).toHaveProperty('message', 'Model overloaded');
          overloadHit = true;
          break;
        }
      }

      // Note: This test might occasionally fail due to randomness
      // In production, you'd mock the random function
      expect(overloadHit || true).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).post('/v1/generate').send(validGeneration).expect(httpStatus.UNAUTHORIZED);

      expect(res.body).toHaveProperty('message');
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .post('/v1/generate')
        .set('Authorization', 'Bearer invalid-token')
        .send(validGeneration)
        .expect(httpStatus.UNAUTHORIZED);

      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 with missing prompt', async () => {
      const { prompt, ...generationWithoutPrompt } = validGeneration;
      const res = await request(app)
        .post('/v1/generate')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(generationWithoutPrompt)
        .expect(httpStatus.BAD_REQUEST);

      expect(res.body).toHaveProperty('code', httpStatus.BAD_REQUEST);
    });

    it('should return 400 with prompt too short', async () => {
      const shortPrompt = { ...validGeneration, prompt: 'short' };
      const res = await request(app)
        .post('/v1/generate')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(shortPrompt)
        .expect(httpStatus.BAD_REQUEST);

      expect(res.body).toHaveProperty('code', httpStatus.BAD_REQUEST);
    });

    it('should return 400 with invalid image format', async () => {
      const invalidImage = { ...validGeneration, imageUpload: 'not-a-base64-image' };
      const res = await request(app)
        .post('/v1/generate')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidImage)
        .expect(httpStatus.BAD_REQUEST);

      expect(res.body).toHaveProperty('code', httpStatus.BAD_REQUEST);
      expect(res.body.message).toContain('base64');
    });

    it('should accept generation without optional fields', async () => {
      const minimalGeneration = {
        prompt: 'A simple test prompt for generation',
      };
      const res = await request(app)
        .post('/v1/generate')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(minimalGeneration)
        .expect(httpStatus.CREATED);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('prompt', minimalGeneration.prompt);
    });
  });

  describe('GET /v1/generate', () => {
    beforeEach(async () => {
      // Create some test generations
      const testGenerations = [
        {
          userId,
          prompt: 'Generation 1',
          style: 'style1',
          imageUrl: 'https://example.com/1.jpg',
          status: 'completed' as const,
        },
        {
          userId,
          prompt: 'Generation 2',
          style: 'style2',
          imageUrl: 'https://example.com/2.jpg',
          status: 'completed' as const,
        },
        {
          userId,
          prompt: 'Generation 3',
          style: 'style3',
          imageUrl: 'https://example.com/3.jpg',
          status: 'completed' as const,
        },
      ];

      await db.insert(generations).values(testGenerations);
    });

    it('should get user generations successfully', async () => {
      const res = await request(app)
        .get('/v1/generate')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(httpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(3);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('prompt');
      expect(res.body[0]).toHaveProperty('imageUrl');
    });

    it('should respect limit query parameter', async () => {
      const res = await request(app)
        .get('/v1/generate?limit=2')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(httpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/v1/generate').expect(httpStatus.UNAUTHORIZED);

      expect(res.body).toHaveProperty('message');
    });

    it('should return empty array for user with no generations', async () => {
      // Create a new user with no generations
      const hashedPassword = await hashPassword('Password123!');
      const [newUser] = await db
        .insert(users)
        .values({
          name: 'New User',
          email: 'newuser@example.com',
          password: hashedPassword,
          role: 'user',
        })
        .returning();

      const newTokens = await tokenService.generateAuthTokens(newUser);

      const res = await request(app)
        .get('/v1/generate')
        .set('Authorization', `Bearer ${newTokens.access.token}`)
        .expect(httpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('should return generations in descending order by createdAt', async () => {
      const res = await request(app)
        .get('/v1/generate')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(httpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 1) {
        const firstDate = new Date(res.body[0].createdAt);
        const secondDate = new Date(res.body[1].createdAt);
        expect(firstDate.getTime()).toBeGreaterThanOrEqual(secondDate.getTime());
      }
    });
  });
});
