const request = require('supertest');
const app = require('../server');

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new student successfully', async () => {
      const res = await request(app).post('/api/auth/register').send({
        firstName: 'Alice',
        lastName: 'Test',
        email: 'alice@test.com',
        password: 'password123',
        role: 'student',
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('alice@test.com');
      expect(res.body.user.role).toBe('student');
      expect(res.body.user.password).toBeUndefined();
    });

    it('should register a new instructor successfully', async () => {
      const res = await request(app).post('/api/auth/register').send({
        firstName: 'Bob',
        lastName: 'Instructor',
        email: 'bob@test.com',
        password: 'password123',
        role: 'instructor',
        instructorProfile: { qualification: 'PhD', experience: 5 },
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.user.role).toBe('instructor');
    });

    it('should reject duplicate email registration', async () => {
      const payload = {
        firstName: 'Alice',
        lastName: 'Test',
        email: 'duplicate@test.com',
        password: 'password123',
        role: 'student',
      };
      await request(app).post('/api/auth/register').send(payload);
      const res = await request(app).post('/api/auth/register').send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should reject registration with invalid email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        firstName: 'A',
        lastName: 'B',
        email: 'not-an-email',
        password: 'password123',
        role: 'student',
      });
      expect(res.statusCode).toBe(400);
    });

    it('should reject registration with short password', async () => {
      const res = await request(app).post('/api/auth/register').send({
        firstName: 'A',
        lastName: 'B',
        email: 'short@test.com',
        password: '123',
        role: 'student',
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        firstName: 'Login',
        lastName: 'User',
        email: 'login@test.com',
        password: 'password123',
        role: 'student',
      });
    });

    it('should login with correct credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'login@test.com',
        password: 'password123',
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('login@test.com');
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'login@test.com',
        password: 'wrongpassword',
      });
      expect(res.statusCode).toBe(401);
    });

    it('should reject login with non-existent email', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nobody@test.com',
        password: 'password123',
      });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const registerRes = await request(app).post('/api/auth/register').send({
        firstName: 'Me',
        lastName: 'User',
        email: 'me@test.com',
        password: 'password123',
        role: 'student',
      });
      const { token } = registerRes.body;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user.email).toBe('me@test.com');
    });

    it('should reject request without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/health', () => {
    it('should return 200', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
    });
  });
});
