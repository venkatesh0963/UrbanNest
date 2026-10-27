import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { attachCurrentUser } from './middleware/auth.js';
import { notFoundHandler, errorHandler } from './middleware/error.js';
import apiRoutes from './routes/index.js';
import { UPLOADS_DIR } from './services/uploadService.js';

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    })
  );

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));
  app.use('/uploads', express.static(UPLOADS_DIR));

  const isProd = env.NODE_ENV === 'production';

  const sessionConfig: session.SessionOptions = {
    name: env.SESSION_COOKIE_NAME,
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: env.SESSION_MAX_AGE_MS,
    },
  };

  if (mongoose.connection.readyState === 1) {
    sessionConfig.store = MongoStore.create({
      client: mongoose.connection.getClient() as unknown as Parameters<
        typeof MongoStore.create
      >[0]['client'],
      collectionName: 'sessions',
      ttl: Math.floor(env.SESSION_MAX_AGE_MS / 1000),
    });
  }

  app.use(session(sessionConfig));
  app.use(attachCurrentUser);

  app.use('/api/v1', apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
