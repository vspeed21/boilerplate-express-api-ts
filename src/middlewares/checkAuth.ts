/* eslint-disable @typescript-eslint/no-explicit-any */
// Check if headers bring token in Autorization

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import environment from '../environment';

interface IDecoded {
  id: string,
  iat: number,
  exp: number,
}

async function checkAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    const error = new Error('There isn\'t token in headers');
    return res.status(404).json({ msg: error.message });
  }

  if (token) {
    try {
      jwt.verify(token, environment.JWT_SECRET) as IDecoded;

      return next();
    } catch (error: any) {
      console.log(error);
      res.status(500).json({
        msg: error.message,
      });
    }
  }
}

export default checkAuth;
