import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { createApp } from './app.js';
import { seedInitialData } from './utils/seed.js';

async function bootstrap() {
  try {
    await connectDatabase();

    if (env.AUTO_SEED) {
      await seedInitialData(false);
    }

    const app = createApp();

    app.listen(env.PORT, () => {
      console.log(`[Server] Urban Nest API running on http://localhost:${env.PORT}/api/v1`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}

bootstrap();
