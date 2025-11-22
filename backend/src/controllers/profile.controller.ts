import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { hashPassword, comparePassword } from '../utils/hash';
import { ObjectId } from 'mongodb';
import { getMongoDB } from '../utils/mongodb';

/**
 * Get user profile
 */
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          bio: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (prismaError: any) {
      if (prismaError.code === 'P2031') {
        const { client, db } = await getMongoDB();
        try {
          const mongoUser = await db.collection('users').findOne({ _id: new ObjectId(userId) });
          user = mongoUser ? {
            id: mongoUser._id.toString(),
            username: mongoUser.username,
            email: mongoUser.email || null,
            firstName: mongoUser.firstName || null,
            lastName: mongoUser.lastName || null,
            bio: mongoUser.bio || null,
            avatar: mongoUser.avatar || null,
            createdAt: mongoUser.createdAt,
            updatedAt: mongoUser.updatedAt,
          } : null;
        } finally {
          await client.close();
        }
      } else {
        throw prismaError;
      }
    }

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { email, firstName, lastName, bio, avatar } = req.body;

    const updateData: any = {
      updatedAt: new Date(),
    };
    if (email !== undefined) updateData.email = email || null;
    if (firstName !== undefined) updateData.firstName = firstName || null;
    if (lastName !== undefined) updateData.lastName = lastName || null;
    if (bio !== undefined) updateData.bio = bio || null;
    if (avatar !== undefined) updateData.avatar = avatar || null;

    let user;
    try {
      user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          bio: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (prismaError: any) {
      if (prismaError.code === 'P2031') {
        const { client, db } = await getMongoDB();
        try {
          await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: updateData }
          );
          const mongoUser = await db.collection('users').findOne({ _id: new ObjectId(userId) });
          user = {
            id: mongoUser!._id.toString(),
            username: mongoUser!.username,
            email: mongoUser!.email || null,
            firstName: mongoUser!.firstName || null,
            lastName: mongoUser!.lastName || null,
            bio: mongoUser!.bio || null,
            avatar: mongoUser!.avatar || null,
            createdAt: mongoUser!.createdAt,
            updatedAt: mongoUser!.updatedAt,
          };
        } finally {
          await client.close();
        }
      } else {
        throw prismaError;
      }
    }

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Change password
 */
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current password and new password are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters' });
      return;
    }

    // Get user with password
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
    } catch (prismaError: any) {
      if (prismaError.code === 'P2031') {
        const { client, db } = await getMongoDB();
        try {
          const mongoUser = await db.collection('users').findOne({ _id: new ObjectId(userId) });
          user = mongoUser ? {
            id: mongoUser._id.toString(),
            username: mongoUser.username,
            password: mongoUser.password,
          } : null;
        } finally {
          await client.close();
        }
      } else {
        throw prismaError;
      }
    }

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
    } catch (prismaError: any) {
      if (prismaError.code === 'P2031') {
        const { client, db } = await getMongoDB();
        try {
          await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: { password: hashedPassword, updatedAt: new Date() } }
          );
        } finally {
          await client.close();
        }
      } else {
        throw prismaError;
      }
    }

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

