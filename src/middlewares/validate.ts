import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';

export function validateRequest(req: Request, res: Response, next: NextFunction) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errors = result.array({ onlyFirstError: true });

    return res.status(400).json({
      message: 'Erro de validação',
      errors: errors.map((err: ValidationError) => ({
        campo: 'param' in err ? err.param : 'desconhecido',
        erro: err.msg,
      })),
    });
  }

  next();
}
