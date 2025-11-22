import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { validate } from '../utils/validation';
import { registerSchema, loginSchema } from '../utils/validation';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', validate(registerSchema), register);

/**
 * POST /api/auth/login
 * Login user and get JWT token
 */
router.post('/login', validate(loginSchema), login);

export default router;

