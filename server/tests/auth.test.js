const request = require('supertest');
const app = require('../app');
const dbHandler = require('./dbHandler');
const User = require('../models/User');

beforeAll(async () => {
  await dbHandler.connect();
});

afterEach(async () => {
  await dbHandler.clearDatabase();
});

afterAll(async () => {
  await dbHandler.closeDatabase();
});

describe('Auth API Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully with status 201', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
          department: 'Computer Science',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('token');
      expect(res.body.name).toBe('Jane Doe');
      expect(res.body.email).toBe('jane@example.com');
      expect(res.body.department).toBe('Computer Science');
      expect(res.body).not.toHaveProperty('password_hash');
    });

    it('should return 400 when name, email, or password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'jane@example.com',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Please provide name, email, and password/i);
    });

    it('should return 400 when registering with an existing email', async () => {
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        password_hash: 'secret123',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'existing@example.com',
          password: 'newpassword123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Email already in use/i);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password_hash: 'password123',
      });
    });

    it('should login an existing user with correct credentials and return 200 and token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.email).toBe('john@example.com');
    });

    it('should return 401 when password is incorrect', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/Invalid email or password/i);
    });

    it('should return 401 when user does not exist', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/Invalid email or password/i);
    });

    it('should return 400 when email or password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Please provide email and password/i);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile when authenticated with valid Bearer token', async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Alex Smith',
          email: 'alex@example.com',
          password: 'password123',
        });

      const token = reg.body.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe('alex@example.com');
      expect(res.body.name).toBe('Alex Smith');
    });

    it('should return 401 unauthorized when no token is provided', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/Not authorized, no token/i);
    });

    it('should return 401 unauthorized when token is invalid or malformed', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token-string');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/Not authorized, token failed/i);
    });
  });
});
