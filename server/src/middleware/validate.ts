import type { Request, Response, NextFunction } from 'express';
import { type ZodTypeAny, ZodError } from 'zod';
import { AppError } from '../utils/errors.js';

export function validateBody(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const formatted = formatZodError(parsed.error);
      return next(new AppError(formatted.message, 400, 'VALIDATION_ERROR', formatted.fieldErrors));
    }
    req.body = parsed.data;
    next();
  };
}

export function validateQuery(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      const formatted = formatZodError(parsed.error);
      return next(new AppError(formatted.message, 400, 'VALIDATION_ERROR', formatted.fieldErrors));
    }
    req.query = parsed.data as unknown as Request['query'];
    next();
  };
}

function formatZodError(error: ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'root';
    if (!fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  const firstMessage = error.issues[0]?.message || 'Invalid request input';
  return { message: firstMessage, fieldErrors };
}
