import { Request, Response } from 'express';
import firebase from '../firebase';


export async function createCarrito(req: Request, res: Response, uid: string) {

  try {
    const newCarrito = {
      uid,
      total: 0,
      productos: [],
      createdAt: new Date(),
      createdBy: 'admin',
    };

    await firebase.db.collection('carritos').add(newCarrito);


  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: 'Error al crear el carrito del usuario' + error,
    });
  }

}
