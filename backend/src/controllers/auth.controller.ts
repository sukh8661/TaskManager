import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateToken } from '../utils/jwt';
import { MongoClient } from 'mongodb';
import { getMongoDB } from '../utils/mongodb';

/**
 * Helper function to create user using raw MongoDB (bypasses transaction requirement)
 */
const createUserWithMongoDB = async (username: string, hashedPassword: string) => {
  const { client, db, dbName } = await getMongoDB();
  try {
    console.log(`👤 Creating user in MongoDB (database: ${dbName})...`);
    const result = await db.collection('users').insertOne({
      username,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✅ User created with ID:', result.insertedId.toString());
    return {
      id: result.insertedId.toString(),
      username,
      createdAt: new Date(),
    };
  } finally {
    await client.close();
  }
};

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    }).catch(async (error: any) => {
      // If transaction error, use MongoDB directly
      if (error.code === 'P2031') {
        const { client, db } = await getMongoDB();
        try {
          const user = await db.collection('users').findOne({ username });
          return user;
        } finally {
          await client.close();
        }
      }
      throw error;
    });

    if (existingUser) {
      res.status(400).json({ error: 'Username already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user - try Prisma first, fallback to MongoDB if transaction error
    let user;
    try {
      user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
        },
        select: {
          id: true,
          username: true,
          createdAt: true,
        },
      });
    } catch (prismaError: any) {
      // If transaction error (P2031), use raw MongoDB
      if (prismaError.code === 'P2031') {
        console.log('⚠️  Prisma transaction error detected. Using MongoDB directly...');
        user = await createUserWithMongoDB(username, hashedPassword);
      } else {
        throw prismaError;
      }
    }

    res.status(201).json({
      message: 'User registered successfully',
      user,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    // Provide more specific error messages
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Username already exists' });
      return;
    }
    if (error.name === 'PrismaClientInitializationError' || error.code === 'P1001') {
      res.status(500).json({ 
        error: 'Database connection failed. Please check your MongoDB connection.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
      return;
    }
    if (error.code === 'P2003') {
      res.status(500).json({ error: 'Database constraint violation' });
      return;
    }
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        code: error.code,
        name: error.name
      } : undefined
    });
  }
};

/**
 * Login user and return JWT token
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Find user - try Prisma first, fallback to MongoDB if transaction error
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { username },
      });
    } catch (prismaError: any) {
      // If transaction error, use MongoDB directly
      if (prismaError.code === 'P2031') {
        const { client, db } = await getMongoDB();
        try {
          const mongoUser = await db.collection('users').findOne({ username });
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
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
