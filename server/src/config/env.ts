import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 5000),
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/urban-nest',
  USE_MEMORY_DB_FALLBACK: process.env.USE_MEMORY_DB_FALLBACK !== 'false',
  AUTO_SEED: process.env.AUTO_SEED !== 'false',
  SESSION_SECRET:
    process.env.SESSION_SECRET || 'urban-nest-dev-super-secret-session-key-change-in-prod',
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME || 'urbannest.sid',
  SESSION_MAX_AGE_MS: Number(process.env.SESSION_MAX_AGE_MS || 7 * 24 * 60 * 60 * 1000),
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER || 'urban-nest',
};
