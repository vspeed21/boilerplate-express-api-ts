/* eslint-disable @typescript-eslint/no-explicit-any */
// Check if headers bring token in Autorization

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import environment from '../environment';
import firebase from '../firebase';

interface IDecoded {
  user: {
    uid: string
    nombre: string
    tipo: string
  },
  iat: number,
  exp: number,
}

async function checkAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    const error = new Error('There isn\'t token in headers');
    return res.status(404).json({ message: error.message });
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, environment.JWT_SECRET) as IDecoded;
      const usuarioRef = await firebase.db.collection('usuarios').where('uid', '==', decoded.user.uid).limit(1).get();
      req.usuario = usuarioRef.docs[0].data();

      return next();
    } catch (error: any) {
      console.log(error);
      res.status(500).json({
        message: error.message,
      });
    }
  }
}

export default checkAuth;
