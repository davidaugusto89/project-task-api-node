import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';

export const app = express();

/** Parse JSON */
app.use(express.json());

/** Health check */
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'This is the way. ⚔️🛡️ (Mandalorian)' });
});

/** Error handler tipado (sem any) */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const status =
    typeof (err as { status?: unknown })?.status === 'number'
      ? (err as { status: number }).status
      : 500;
  const message = err instanceof Error ? err.message : 'Algo deu errado no servidor :(';
  res.status(status).json({ error: message });
});
