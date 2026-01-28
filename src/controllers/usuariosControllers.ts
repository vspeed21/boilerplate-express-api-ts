import { Request, Response } from 'express';
import firebase from '../firebase';
import { FIREBASE_COLLECTION_NAMES } from '../constants';

export async function convertirAEmprendedor(req: Request, res: Response) {
  const { uid } = req.usuario;

  const { descripcion, direccion, email, nombre, representante, slogan, telefono } = req.body;

  if (!descripcion || !direccion || !email || !nombre || !representante || !telefono) {
    return res.status(400).json({
      code: 400,
      message: 'Faltan datos requeridos. Verifique',
    });
  }

  try {
    // Obtener la informacion del usuario logueado;
    const usuarioRef = await firebase.db.collection(FIREBASE_COLLECTION_NAMES.usuarios).where('uid', '==', uid).get();

    // Obtener el documento del usuario logueado.
    const usuarioDoc = firebase.db.collection(FIREBASE_COLLECTION_NAMES.usuarios).doc(usuarioRef.docs[0].id);

    // Instnacia de la coleccion de emprendimientos.
    const emprendimiento = firebase.db.collection(FIREBASE_COLLECTION_NAMES.emprendimientos);

    // Crear emprendimiento en firebase.
    await emprendimiento.add({
      descripcion, direccion, email, nombre,
      representante, telefono,
      uid,
      slogan: slogan ? slogan : '',
    });

    // Actualizar el tipo de usuario a 'emprendedor'
    await usuarioDoc.update({
      tipo: 'emprendedor',
    });

    res.status(200).json({
      code: 200,
      message: 'Usuario convertido a emprendedor correctamente',
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: 'Ha ocurrido un error inesperadao: ' + error
    });
  }

}


export async function saveTokenFCM(req: Request, res: Response) {
  const { token } = req.body;

  if (!token) return;

  try {
    const usuarioDoc = firebase.db.collection(FIREBASE_COLLECTION_NAMES.usuarios).doc(req.usuario.uid);

    await usuarioDoc.update({
      token
    });

    res.status(200).json({
      code: 200,
      message: 'Token actualizado con exito.',
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: 'Ocurrio un error al guardar el token' + error,
    });
  }

}
