import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('❌ Error:', err.message);

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: err.message,
  });
}

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
}
