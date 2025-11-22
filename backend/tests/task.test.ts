import request from 'supertest';
import app from '../src/server';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/hash';
import { generateToken } from '../src/utils/jwt';

const prisma = new PrismaClient();

describe('Task Routes', () => {
  let authToken: string;
  let userId: string;
  const testUser = {
    username: 'taskuser',
    password: 'testpass123',
  };

  beforeEach(async () => {
    // Clean up test data
    await prisma.task.deleteMany({});
    await prisma.user.deleteMany({});

    // Create test user and get token
    const hashedPassword = await hashPassword(testUser.password);
    const user = await prisma.user.create({
      data: {
        username: testUser.username,
        password: hashedPassword,
      },
    });
    userId = user.id;
    authToken = generateToken(user.id);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/tasks', () => {
    it('should get all tasks for authenticated user', async () => {
      // Create some tasks
      await prisma.task.createMany({
        data: [
          { title: 'Task 1', userId, status: 'pending' },
          { title: 'Task 2', userId, status: 'completed' },
        ],
      });

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
    });

    it('should require authentication', async () => {
      await request(app).get('/api/tasks').expect(401);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const newTask = {
        title: 'New Task',
        description: 'Task description',
        status: 'pending',
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newTask)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newTask.title);
      expect(response.body.status).toBe(newTask.status);
    });

    it('should validate task data', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: '', status: 'invalid' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation error');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      const task = await prisma.task.create({
        data: { title: 'Original Task', userId, status: 'pending' },
      });

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Task', status: 'completed' })
        .expect(200);

      expect(response.body.title).toBe('Updated Task');
      expect(response.body.status).toBe('completed');
    });

    it('should return 404 for non-existent task', async () => {
      await request(app)
        .put('/api/tasks/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Task' })
        .expect(404);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const task = await prisma.task.create({
        data: { title: 'Task to Delete', userId, status: 'pending' },
      });

      await request(app)
        .delete(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify task is deleted
      const deletedTask = await prisma.task.findUnique({
        where: { id: task.id },
      });
      expect(deletedTask).toBeNull();
    });

    it('should return 404 for non-existent task', async () => {
      await request(app)
        .delete('/api/tasks/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});

