import 'dotenv/config';
import { randomUUID } from 'crypto';

import compression from 'compression';
import cors, { CorsOptions } from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';

import projectsRouter from './routes/projects.routes';
import tasksRouter from './routes/tasks.routes';
import { setupSwagger } from './swagger';

// --- Tipagem para request-id ---
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

// --- App ---
export const app = express();

// Segurança básica / proxies
app.disable('x-powered-by');
app.set('trust proxy', 1);

// Middlewares globais
app.use(helmet());
app.use(compression());

// Tamanho de payload
const jsonLimit = process.env.JSON_LIMIT ?? '1mb';
app.use(express.json({ limit: jsonLimit }));
app.use(express.urlencoded({ extended: true, limit: jsonLimit }));

// CORS explícito
const allowedOrigins = (process.env.CORS_ORIGIN ?? '*')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions: CorsOptions = {
  origin: allowedOrigins.length === 1 && allowedOrigins[0] === '*' ? true : allowedOrigins,
  credentials: true,
};
app.use(cors(corsOptions));

// Request ID para correlação
app.use((req, _res, next) => {
  req.id = req.headers['x-request-id']?.toString() || randomUUID();
  next();
});
morgan.token('id', (req: Request) => req.id ?? '-');
app.use(morgan('[:id] :method :url :status :response-time ms - :res[content-length]'));

// Rate limit
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX ?? 100),
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/health',
  }),
);

// Healthcheck simples (mantém compatibilidade com testes e2e)
app.get('/health', (_req, res) => {
  return res.status(200).json({ status: 'ok' });
});

// Swagger (mantém /api-docs)
setupSwagger(app);

// Rotas do domínio
app.use('/', projectsRouter);
app.use('/', tasksRouter);

// 404 handler (após as rotas)
app.use((_req, res) => {
  return res.status(404).json({ error: { message: 'Not Found' } });
});

// AppError para padronizar erros
export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Error handler central
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  // Log mínimo estruturado
  // (Evite logar dados sensíveis de req.body)
  console.error('[error]', {
    reqId: req.id,
    path: req.path,
    method: req.method,
    err,
  });

  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: { message: err.message, code: err.code, details: err.details, reqId: req.id },
    });
  }

  // Erros de validação
  return res.status(500).json({
    error: { message: 'Internal Server Error', reqId: req.id },
  });
});
