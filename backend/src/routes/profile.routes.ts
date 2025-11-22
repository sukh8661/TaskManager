import { Router } from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/profile.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../utils/validation';
import { z } from 'zod';

const router = Router();

// All profile routes require authentication
router.use(authenticateToken);

// Profile update schema
const profileUpdateSchema = z.object({
  email: z.string().email('Invalid email format').optional().nullable(),
  firstName: z.string().max(50, 'First name must be at most 50 characters').optional().nullable(),
  lastName: z.string().max(50, 'Last name must be at most 50 characters').optional().nullable(),
  bio: z.string().max(500, 'Bio must be at most 500 characters').optional().nullable(),
  avatar: z.string().url('Invalid URL format').optional().nullable(),
});

// Change password schema
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').max(100, 'Password must be at most 100 characters'),
});

/**
 * GET /api/profile
 * Get current user's profile
 */
router.get('/', getProfile);

/**
 * PUT /api/profile
 * Update current user's profile
 */
router.put('/', validate(profileUpdateSchema), updateProfile);

/**
 * POST /api/profile/change-password
 * Change user's password
 */
router.post('/change-password', validate(changePasswordSchema), changePassword);

export default router;

