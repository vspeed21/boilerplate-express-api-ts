import { Request, Response } from 'express';
import firebase from '../firebase';
import { createCarrito } from '../helpers/crearCarritoFirebase';
import generateJWT from '../helpers/generateJWT';

export async function signUpUser(req: Request, res: Response) {
  const { email, password, nombre } = req.body;

  if (!email || !password || !nombre) {
    return res.status(404).json({
      code: 404,
      error: true,
      showAlert: true,
      message: 'Faltan datos obligatorios. Revise',
    });
  }

  const newUser = {
    email,
    password,
    nombre,
    tipo: 'comprador',
    createdAt: new Date()
  };

  try {
    if (password.length < 8) {
      return res.json({
        error: true,
        showAlert: true,
        message: 'La contraseña debe de ser de al menos 8 caracteres',
      });
    }

    // Validar si existe el usuario
    const usuarioRef = await firebase.db.collection('usuarios').where('email', '==', email).get();
    if (usuarioRef.size) {
      return res.status(409).json({
        code: 409,
        error: true,
        showAlert: true,
        message: 'Ya existe este usuario. Inicie sesión',
      });
    }

    // Crear usuario en collecion usuarios
    const usuario = await firebase.db.collection('usuarios').add(newUser);

    await createCarrito(req, res, usuario.id);

    await usuario.update({
      uid: usuario.id
    });

    res.json({
      code: 201,
      error: false,
      showAlert: true,
      message: 'Usuario creado correctamente. Inicie Sesión',
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      error: true,
      message: 'Error al crear el usuario: ' + error
    });
  }

}

export async function logInUser(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(404).json({
      code: 404,
      message: 'El correo y contraseña son obligatorios. Verifique'
    });
  }

  // Validar sintaxis de email

  // Validar longitud de contraseña (8 caracteres como minimo)

  if (password.length < 8) {
    return res.status(404).json({
      code: 404,
      error: true,
      message: 'La contraseña debe de tener 8 caracteres'
    });
  }

  try {
    const usuarioRef = await firebase.db.collection('usuarios').where('email', '==', email).limit(1).get();
    if (usuarioRef.size == 0) {
      return res.status(404).json({
        code: 404,
        error: true,
        message: 'No se encontro usuario registrado con el email proporcionado. Cree la cuenta',
      });
    }

    if (password != usuarioRef.docs[0].data().password) {
      return res.json({
        error: false,
        message: 'La contraseña es incorrecta',
      });
    }

    res.status(200).json({
      code: 200,
      message: 'Credenciales correctas. Bienvenido',
      usuario: {
        nombre: usuarioRef.docs[0].data().nombre,
        email: usuarioRef.docs[0].data().email,
        tipo: usuarioRef.docs[0].data().tipo,
      },
      token: generateJWT({
        uid: usuarioRef.docs[0].id,
        nombre: usuarioRef.docs[0].data().nombre,
        tipo: usuarioRef.docs[0].data().tipo,
      }),
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: 'Error de autenticación',
    });
  }

}
