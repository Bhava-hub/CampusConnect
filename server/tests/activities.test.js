const request = require('supertest');
const app = require('../app');
const dbHandler = require('./dbHandler');
const User = require('../models/User');
const Activity = require('../models/Activity');

beforeAll(async () => {
  await dbHandler.connect();
});

afterEach(async () => {
  await dbHandler.clearDatabase();
});

afterAll(async () => {
  await dbHandler.closeDatabase();
});

describe('Activities & Health API Endpoints', () => {
  let userToken;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Organizer Sam',
        email: 'sam@example.com',
        password: 'password123',
        department: 'Sports Council',
      });
    userToken = res.body.token;
  });

  describe('Health Checks', () => {
    it('should return 200 and API status message on GET /', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('CampusConnect API running');
    });

    it('should return 200 on /health for Docker health checks', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.message).toBe('CampusConnect API running');
    });
  });

  describe('POST /api/activities', () => {
    it('should create an activity successfully (201)', async () => {
      const res = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Campus Hackathon 2026',
          description: 'Annual 24-hour coding hackathon in the main auditorium',
          people_needed: 4,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.title).toBe('Campus Hackathon 2026');
      expect(res.body.people_needed).toBe(4);
      expect(res.body.status).toBe('open');
    });

    it('should return 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          description: 'Missing title and people_needed',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Title and people_needed are required/i);
    });
  });

  describe('GET /api/activities', () => {
    it('should retrieve activities list (200)', async () => {
      await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Football Match',
          description: 'Friendly match between departments',
          people_needed: 11,
        });

      const res = await request(app).get('/api/activities');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe('Football Match');
    });
  });
});
