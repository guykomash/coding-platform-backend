import exp from 'constants';
import { Request, Response, NextFunction } from 'express';

export default function logger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.url.startsWith('/socket'))
    console.log(`LOGGER: ${req.method}  ${req.url}`);
  next();
}
