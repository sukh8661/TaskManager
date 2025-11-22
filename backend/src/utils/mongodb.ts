import { MongoClient } from 'mongodb';

/**
 * Get MongoDB database instance from connection string
 * Extracts database name from DATABASE_URL
 */
export const getMongoDB = async () => {
  const connectionString = process.env.DATABASE_URL || '';
  const client = new MongoClient(connectionString);
  await client.connect();
  
  // Extract database name from connection string
  // Format: mongodb://host:port/database or mongodb+srv://host/database
  let dbName = 'taskmanagement'; // default
  try {
    const url = new URL(connectionString.replace('mongodb+srv://', 'mongodb://'));
    const pathParts = url.pathname.split('/');
    if (pathParts.length > 1 && pathParts[1]) {
      dbName = pathParts[1].split('?')[0]; // Remove query params
    }
  } catch (e) {
    // If URL parsing fails, try to extract from connection string
    const match = connectionString.match(/\/([^/?]+)(\?|$)/);
    if (match && match[1]) {
      dbName = match[1];
    }
  }
  
  const db = client.db(dbName);
  return { client, db, dbName };
};

