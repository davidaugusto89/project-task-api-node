import http from 'http';

import { z } from 'zod';

import { sequelize } from './models';
import { app } from './server';

// Validação de variáveis de ambiente (fail-fast)
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),

  // Opcionais, usados se sua app integrar Redis/GitHub/JWT
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.coerce.number().int().positive().optional(),
  GITHUB_TOKEN: z.string().optional(),
  JWT_SECRET: z.string().optional(),
});
const env = envSchema.parse(process.env);

let server: http.Server | undefined;

// Bootstrap
async function start() {
  console.log(
    `[boot] env=${env.NODE_ENV} port=${env.PORT} db=${env.DB_USER}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`,
  );

  // Garante DB pronto antes de subir a API
  await sequelize.authenticate();
  console.log('[boot] DB connected');

  server = app.listen(env.PORT, () => {
    console.log(`[boot] API listening on http://localhost:${env.PORT}`);
  });

  server.on('error', (err) => {
    console.error('[server:error]', err);
    process.exit(1);
  });
}

// Encerramento gracioso (HTTP + Sequelize)
async function shutdown(reason: string, code = 0) {
  console.log(`[shutdown] reason=${reason}`);
  try {
    if (server) {
      await new Promise<void>((resolve) => server!.close(() => resolve()));
    }
    await sequelize.close();
    console.log('[shutdown] resources closed');
  } catch (err) {
    console.error('[shutdown:error]', err);
    code = code || 1;
  } finally {
    process.exit(code);
  }
}

// Sinais/erros de processo
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('unhandledRejection', (err) => {
  console.error('[unhandledRejection]', err);
  void shutdown('unhandledRejection', 1);
});
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
  void shutdown('uncaughtException', 1);
});

// Start app
start().catch((err) => {
  console.error('[boot:error]', err);
  process.exit(1);
});
