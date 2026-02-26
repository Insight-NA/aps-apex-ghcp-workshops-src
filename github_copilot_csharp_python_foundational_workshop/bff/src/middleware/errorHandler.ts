import { Request, Response, NextFunction } from 'express';

interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  requestId?: string;
}

/**
 * Global error handler - normalizes error responses regardless of backend language.
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const statusCode = (err as any).statusCode || 500;
  const response: ErrorResponse = {
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred',
    statusCode,
    requestId: req.headers['x-request-id'] as string,
  };

  console.error(`[${response.requestId}] ${statusCode} ${err.message}`, err.stack);
  res.status(statusCode).json(response);
}
