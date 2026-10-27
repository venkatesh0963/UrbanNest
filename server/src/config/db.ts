import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from './env.js';

let memoryServer: MongoMemoryServer | null = null;
let activeMongoUri: string = env.MONGODB_URI;

export async function connectDatabase(forceMemory = false): Promise<string> {
  mongoose.set('strictQuery', true);

  if (!forceMemory && env.NODE_ENV !== 'test') {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 2500,
      });
      activeMongoUri = env.MONGODB_URI;
      console.log(`[DB] Connected to MongoDB at ${env.MONGODB_URI}`);
      return activeMongoUri;
    } catch (err) {
      if (!env.USE_MEMORY_DB_FALLBACK) {
        throw err;
      }
      console.warn(
        `[DB] Local MongoDB at ${env.MONGODB_URI} unreachable. Falling back to in-memory MongoDB server...`
      );
    }
  }

  memoryServer = await MongoMemoryServer.create();
  activeMongoUri = memoryServer.getUri();
  await mongoose.connect(activeMongoUri);
  console.log(`[DB] Connected to in-memory MongoDB (${activeMongoUri})`);
  return activeMongoUri;
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

export function getActiveMongoUri(): string {
  return activeMongoUri;
}
