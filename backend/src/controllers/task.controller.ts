import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { ObjectId } from 'mongodb';
import { getMongoDB } from '../utils/mongodb';

/**
 * Helper to convert MongoDB operations when transaction error occurs
 */
const useMongoDBDirect = async (operation: () => Promise<any>, fallback: () => Promise<any>) => {
  try {
    return await operation();
  } catch (error: any) {
    if (error.code === 'P2031') {
      console.log('⚠️  Using MongoDB directly due to transaction error...');
      return await fallback();
    }
    throw error;
  }
};

/**
 * Get all tasks for the authenticated user
 */
export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const tasks = await useMongoDBDirect(
      async () => {
        return await prisma.task.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
      },
      async () => {
        const { client, db, dbName } = await getMongoDB();
        try {
          console.log(`📋 Fetching tasks from MongoDB (database: ${dbName})...`);
          const tasks = await db.collection('tasks')
            .find({ userId: new ObjectId(userId) })
            .sort({ createdAt: -1 })
            .toArray();
          console.log(`✅ Found ${tasks.length} tasks for user ${userId}`);
          return tasks.map((task: any) => ({
            id: task._id.toString(),
            userId: task.userId.toString(),
            title: task.title,
            description: task.description,
            status: task.status,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
          }));
        } catch (mongoError: any) {
          console.error('❌ MongoDB task fetch error:', mongoError);
          throw mongoError;
        } finally {
          await client.close();
        }
      }
    );

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create a new task
 */
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { title, description, status } = req.body;

    const task = await useMongoDBDirect(
      async () => {
        return await prisma.task.create({
          data: {
            title,
            description: description || null,
            status: status || 'pending',
            userId,
          },
        });
      },
      async () => {
        const { client, db, dbName } = await getMongoDB();
        try {
          console.log(`📝 Creating task in MongoDB (database: ${dbName})...`);
          const taskData = {
            userId: new ObjectId(userId),
            title,
            description: description || null,
            status: status || 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          console.log('Task data:', JSON.stringify(taskData, null, 2));
          const result = await db.collection('tasks').insertOne(taskData);
          console.log('✅ Task created with ID:', result.insertedId.toString());
          const task = await db.collection('tasks').findOne({ _id: result.insertedId });
          if (!task) {
            throw new Error('Task not found after creation');
          }
          console.log('✅ Task retrieved from database:', JSON.stringify(task, null, 2));
          return {
            id: task._id.toString(),
            userId: task.userId.toString(),
            title: task.title,
            description: task.description,
            status: task.status,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
          };
        } catch (mongoError: any) {
          console.error('❌ MongoDB task creation error:', mongoError);
          console.error('Error details:', JSON.stringify(mongoError, null, 2));
          throw mongoError;
        } finally {
          await client.close();
        }
      }
    );

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update a task
 */
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const taskId = req.params.id;
    const { title, description, status } = req.body;

    // Check if task exists and belongs to user
    const existingTask = await useMongoDBDirect(
      async () => {
        return await prisma.task.findFirst({
          where: {
            id: taskId,
            userId,
          },
        });
      },
      async () => {
        const { client, db } = await getMongoDB();
        try {
          const task = await db.collection('tasks').findOne({
            _id: new ObjectId(taskId),
            userId: new ObjectId(userId),
          });
          return task ? {
            id: task._id.toString(),
            userId: task.userId.toString(),
            title: task.title,
            description: task.description,
            status: task.status,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
          } : null;
        } finally {
          await client.close();
        }
      }
    );

    if (!existingTask) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    // Update task
    const task = await useMongoDBDirect(
      async () => {
        return await prisma.task.update({
          where: { id: taskId },
          data: {
            ...(title && { title }),
            ...(description !== undefined && { description: description || null }),
            ...(status && { status }),
          },
        });
      },
      async () => {
        const { client, db } = await getMongoDB();
        try {
          const updateData: any = { updatedAt: new Date() };
          if (title) updateData.title = title;
          if (description !== undefined) updateData.description = description || null;
          if (status) updateData.status = status;
          
          await db.collection('tasks').updateOne(
            { _id: new ObjectId(taskId) },
            { $set: updateData }
          );
          const task = await db.collection('tasks').findOne({ _id: new ObjectId(taskId) });
          return {
            id: task!._id.toString(),
            userId: task!.userId.toString(),
            title: task!.title,
            description: task!.description,
            status: task!.status,
            createdAt: task!.createdAt,
            updatedAt: task!.updatedAt,
          };
        } finally {
          await client.close();
        }
      }
    );

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const taskId = req.params.id;

    // Check if task exists and belongs to user
    const existingTask = await useMongoDBDirect(
      async () => {
        return await prisma.task.findFirst({
          where: {
            id: taskId,
            userId,
          },
        });
      },
      async () => {
        const { client, db } = await getMongoDB();
        try {
          const task = await db.collection('tasks').findOne({
            _id: new ObjectId(taskId),
            userId: new ObjectId(userId),
          });
          return task;
        } finally {
          await client.close();
        }
      }
    );

    if (!existingTask) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    // Delete task
    await useMongoDBDirect(
      async () => {
        await prisma.task.delete({
          where: { id: taskId },
        });
      },
      async () => {
        const { client, db } = await getMongoDB();
        try {
          const result = await db.collection('tasks').deleteOne({ _id: new ObjectId(taskId) });
          console.log('✅ Task deleted:', result.deletedCount > 0);
        } finally {
          await client.close();
        }
      }
    );

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
