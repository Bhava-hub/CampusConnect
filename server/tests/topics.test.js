const request = require('supertest');
const app = require('../app');
const dbHandler = require('./dbHandler');
const User = require('../models/User');
const Topic = require('../models/Topic');
const Explanation = require('../models/Explanation');

beforeAll(async () => {
  await dbHandler.connect();
});

afterEach(async () => {
  await dbHandler.clearDatabase();
});

afterAll(async () => {
  await dbHandler.closeDatabase();
});

describe('Topics API Endpoints', () => {
  let userToken;
  let userId;
  let secondUserToken;

  beforeEach(async () => {
    // Create primary user
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice Springs',
        email: 'alice@example.com',
        password: 'password123',
        department: 'Information Technology',
      });
    userToken = res1.body.token;
    userId = res1.body._id;

    // Create second user
    const res2 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Bob Builder',
        email: 'bob@example.com',
        password: 'password123',
        department: 'Mechanical',
      });
    secondUserToken = res2.body.token;
  });

  describe('POST /api/topics', () => {
    it('should create a new topic when authenticated with valid data (201)', async () => {
      const res = await request(app)
        .post('/api/topics')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Understanding Dijkstra Algorithm',
          description: 'Can someone explain the shortest path greedy approach in simple terms?',
          category: 'Algorithms',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.title).toBe('Understanding Dijkstra Algorithm');
      expect(res.body.category).toBe('Algorithms');
      expect(res.body.user_id).toBeDefined();
    });

    it('should return 400 when title or description is missing', async () => {
      const res = await request(app)
        .post('/api/topics')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          category: 'Algorithms',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Title and description are required/i);
    });

    it('should return 401 when unauthenticated request tries to create topic', async () => {
      const res = await request(app)
        .post('/api/topics')
        .send({
          title: 'Unauthorized Topic',
          description: 'This should fail because no bearer token is present',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/Not authorized/i);
    });
  });

  describe('GET /api/topics', () => {
    it('should retrieve all topics with explanation counts (200)', async () => {
      // Create a topic
      const topic = await Topic.create({
        user_id: userId,
        title: 'Binary Search Trees',
        description: 'How to handle rebalancing in AVL trees?',
        category: 'Data Structures',
      });

      // Add an explanation
      await Explanation.create({
        topic_id: topic._id,
        user_id: userId,
        content: 'AVL trees perform single or double rotations based on balance factor.',
      });

      const res = await request(app).get('/api/topics');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe('Binary Search Trees');
      expect(res.body[0].explanationCount).toBe(1);
    });
  });

  describe('GET /api/topics/:id', () => {
    it('should retrieve a single topic by ID along with its explanations (200)', async () => {
      const topic = await Topic.create({
        user_id: userId,
        title: 'React Hooks Lifecycle',
        description: 'How does useEffect clean up work?',
        category: 'Web Dev',
      });

      const res = await request(app).get(`/api/topics/${topic._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.topic).toBeDefined();
      expect(res.body.topic.title).toBe('React Hooks Lifecycle');
      expect(Array.isArray(res.body.explanations)).toBe(true);
    });

    it('should return 404 if topic does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).get(`/api/topics/${fakeId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/Topic not found/i);
    });
  });

  describe('DELETE /api/topics/:id', () => {
    it('should allow the creator to delete their topic (200)', async () => {
      const topic = await Topic.create({
        user_id: userId,
        title: 'Temporary Question',
        description: 'Will be deleted shortly',
      });

      const res = await request(app)
        .delete(`/api/topics/${topic._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/deleted successfully/i);

      const check = await Topic.findById(topic._id);
      expect(check).toBeNull();
    });

    it('should forbid non-creator non-admin user from deleting topic (403)', async () => {
      const topic = await Topic.create({
        user_id: userId,
        title: 'Alice Topic',
        description: 'Protected content',
      });

      const res = await request(app)
        .delete(`/api/topics/${topic._id}`)
        .set('Authorization', `Bearer ${secondUserToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/Not authorized to delete this topic/i);
    });
  });
});
