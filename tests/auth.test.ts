import app from '@/app';
import db from '@/db';
import { users } from '@/db/schema';
import { hashPassword } from '@/utils/password-hash';
import { eq } from 'drizzle-orm';
import httpStatus from 'http-status';
import request from 'supertest';

describe('Auth Routes', () => {
  beforeEach(async () => {
    // Clean up users table before each test
    await db.delete(users);
  });

  afterAll(async () => {
    // Clean up after all tests
    await db.delete(users);
  });

  describe('POST /v1/auth/register', () => {
    const validUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      role: 'user',
    };

    it('should register a new user successfully', async () => {
      const res = await request(app).post('/v1/auth/register').send(validUser).expect(httpStatus.CREATED);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email', validUser.email);
      expect(res.body).toHaveProperty('name', validUser.name);
      expect(res.body).not.toHaveProperty('password');
    });

    it('should return 400 if email is already taken', async () => {
      await request(app).post('/v1/auth/register').send(validUser).expect(httpStatus.CREATED);

      const res = await request(app).post('/v1/auth/register').send(validUser).expect(httpStatus.BAD_REQUEST);

      expect(res.body).toHaveProperty('message', 'Email is already taken');
    });

    it('should return 400 if email is invalid', async () => {
      const invalidUser = { ...validUser, email: 'invalid-email' };
      const res = await request(app).post('/v1/auth/register').send(invalidUser).expect(httpStatus.BAD_REQUEST);

      expect(res.body).toHaveProperty('code', httpStatus.BAD_REQUEST);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 if password is too weak', async () => {
      const weakPasswordUser = { ...validUser, password: '123' };
      const res = await request(app)
        .post('/v1/auth/register')
        .send(weakPasswordUser)
        .expect(httpStatus.BAD_REQUEST);

      expect(res.body).toHaveProperty('code', httpStatus.BAD_REQUEST);
    });

    it('should return 400 if name is missing', async () => {
      const { name, ...userWithoutName } = validUser;
      const res = await request(app)
        .post('/v1/auth/register')
        .send(userWithoutName)
        .expect(httpStatus.BAD_REQUEST);

      expect(res.body).toHaveProperty('code', httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/auth/login', () => {
    const userCredentials = {
      email: 'login@example.com',
      password: 'Password123!',
    };

    beforeEach(async () => {
      // Create a user for login tests
      const hashedPassword = await hashPassword(userCredentials.password);
      await db.insert(users).values({
        name: 'Login User',
        email: userCredentials.email,
        password: hashedPassword,
        role: 'user',
      });
    });

    it('should login successfully with valid credentials', async () => {
      const res = await request(app).post('/v1/auth/login').send(userCredentials).expect(httpStatus.OK);

      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', userCredentials.email);
      expect(res.body.user).not.toHaveProperty('password');
      expect(res.body.token).toHaveProperty('access');
      expect(res.body.token).toHaveProperty('refresh');
    });

    it('should return 401 with incorrect password', async () => {
      const wrongPassword = { ...userCredentials, password: 'WrongPassword123!' };
      const res = await request(app).post('/v1/auth/login').send(wrongPassword).expect(httpStatus.UNAUTHORIZED);

      expect(res.body).toHaveProperty('message', 'Incorrect email or password');
    });

    it('should return 401 with non-existent email', async () => {
      const nonExistentUser = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };
      const res = await request(app).post('/v1/auth/login').send(nonExistentUser).expect(httpStatus.UNAUTHORIZED);

      expect(res.body).toHaveProperty('message', 'Incorrect email or password');
    });

    it('should return 400 with invalid email format', async () => {
      const invalidEmail = { ...userCredentials, email: 'invalid-email' };
      const res = await request(app).post('/v1/auth/login').send(invalidEmail).expect(httpStatus.BAD_REQUEST);

      expect(res.body).toHaveProperty('code', httpStatus.BAD_REQUEST);
    });

    it('should return 400 with missing password', async () => {
      const { password, ...credentialsWithoutPassword } = userCredentials;
      const res = await request(app)
        .post('/v1/auth/login')
        .send(credentialsWithoutPassword)
        .expect(httpStatus.BAD_REQUEST);

      expect(res.body).toHaveProperty('code', httpStatus.BAD_REQUEST);
    });
  });
});
