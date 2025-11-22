import { Router } from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/task.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../utils/validation';
import { taskSchema, taskUpdateSchema } from '../utils/validation';

const router = Router();

// All task routes require authentication
router.use(authenticateToken);

/**
 * GET /api/tasks
 * Get all tasks for the authenticated user
 */
router.get('/', getTasks);

/**
 * POST /api/tasks
 * Create a new task
 */
router.post('/', validate(taskSchema), createTask);

/**
 * PUT /api/tasks/:id
 * Update a task
 */
router.put('/:id', validate(taskUpdateSchema), updateTask);

/**
 * DELETE /api/tasks/:id
 * Delete a task
 */
router.delete('/:id', deleteTask);

export default router;

