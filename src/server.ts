import 'dotenv/config';
import compression from 'compression';
import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';

import projectsRouter from './routes/projects.routes';
import tasksRouter from './routes/tasks.routes';
import { setupSwagger } from './swagger';

export const app = express();

/** Confiança em proxy (necessário para IP correto no rate-limit quando atrás de proxy/reverse-proxy) */
app.set('trust proxy', 1);

/** Parsers */
app.use(express.json());

/** CORS (origem configurável por env; aceita lista separada por vírgulas) */
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
  : ['*'];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

/** Helmet (headers de segurança; CORP liberado para evitar bloqueios com assets estáticos) */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

/** Compression (gzip) */
app.use(compression());

/** Rate limiting (padrão: 100 req/min) — ignora health, OPTIONS e /api-docs */
const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
const limit = Number(process.env.RATE_LIMIT_MAX ?? 100);

const limiter = rateLimit({
  windowMs,
  limit,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    req.method === 'OPTIONS' || req.path === '/health' || req.path.startsWith('/api-docs'),
});
app.use(limiter);

/** Logger */
app.use(morgan('dev'));

/** Swagger */
setupSwagger(app);

/** Rotas */
app.use('/', projectsRouter);
app.use('/', tasksRouter);

/** Health */
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'This is the way.' });
});

// Error handler tipado (sem any)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const status =
    typeof (err as { status?: unknown })?.status === 'number'
      ? (err as { status: number }).status
      : 500;
  const message = err instanceof Error ? err.message : 'Internal Server Error';
  res.status(status).json({ error: message });
});
