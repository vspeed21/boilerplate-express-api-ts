/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import firebase from '../firebase';
import { deleteImages, uploadImages } from '../helpers/uploadImages';
import { FIREBASE_COLLECTION_NAMES } from '../constants';


export async function getCategorias(req: Request, res: Response) {
  try {
    const querySnapshot = await firebase.db.collection(FIREBASE_COLLECTION_NAMES.categorias).orderBy('nombre', 'asc').get();

    res.status(200).json({
      code: 200,
      message: 'Categorías obtenidas correctamente',
      length: querySnapshot.size,
      data: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: 'Error al obtener las categorías: ' + error,
    });
  }
}

export async function getCategoriaById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const doc = await firebase.db.collection(FIREBASE_COLLECTION_NAMES.categorias).doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        code: 404,
        message: 'La categoría solicitada no fue encontrada',
      });
    }

    res.status(200).json({
      code: 200,
      message: 'Categoría obtenida correctamente',
      data: { id: doc.id, ...doc.data() },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: 'Error al obtener la categoría: ' + error,
    });
  }
}

export async function createCategoria(req: Request, res: Response) {
  const { nombre, imagenUrl } = req.body;

  if (!nombre || !imagenUrl) {
    return res.status(400).json({
      code: 400,
      message: 'Faltan datos obligatorios: nombre e imagenUrl. Verifique e intente nuevamente.',
    });
  }

  try {
    const newCategoria = {
      nombre,
      imagenUrl,
      createdAt: new Date(),
      createdBy: req.usuario ? req.usuario.nombre : 'admin',
    };

    const docRef = await firebase.db.collection(FIREBASE_COLLECTION_NAMES.categorias).add(newCategoria);

    res.status(201).json({
      code: 201,
      message: 'Categoría creada correctamente',
      data: { id: docRef.id, ...newCategoria },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: 'Error al crear la categoría: ' + error,
    });
  }

}

export async function updateCategoria(req: Request, res: Response) {
  const { id } = req.params;
  const { nombre } = req.body;


  if (!nombre) {
    return res.status(400).json({
      code: 400,
      message: 'Faltan datos obligatorios: nombre. Verifique e intente nuevamente.',
    });
  }
  try {
    const categoriaRef = firebase.db.collection(FIREBASE_COLLECTION_NAMES.categorias).doc(id);
    const doc = await categoriaRef.get();
    if (!doc.exists) {
      return res.status(404).json({
        code: 404,
        message: `No se encontro la categoría solicitada con el id proporcionado: '${id}'`,
      });
    }

    await categoriaRef.update({
      nombre,
      imagenUrl: doc.data()?.imagenUrl,
      updatedAt: new Date(),
      updatedBy: req.usuario ? req.usuario.nombre : 'admin',
    });

    res.status(200).json({
      code: 200,
      message: 'Categoría actualizada correctamente',
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: 'Error al actualizar la categoría: ' + error,
    });
  }
}

export async function deleteImagenCategoria(req: Request, res: Response) {
  const { imagenNombre } = req.body;
  const { id: idCategoria } = req.params;

  if (!imagenNombre || !idCategoria) {
    return res.status(400).json({
      code: 400,
      message: 'Faltan datos obligatorios: imagenNombre y idCategoria. Verifique e intente nuevamente.',
    });
  }

  try {
    await deleteImages(`categorias/${imagenNombre}`);

    const categoriaRef = firebase.db.collection(FIREBASE_COLLECTION_NAMES.categorias).doc(idCategoria);

    await categoriaRef.update({
      imagenUrl: '',
      updatedAt: new Date(),
      updatedBy: req.usuario ? req.usuario.nombre : 'admin',
    });

    res.status(200).json({
      code: 200,
      message: 'Imagen de la categoría eliminada. Agregue una nueva',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: 'Error al eliminar la imagen de la categoría: ' + error,
    });
  }

}

export async function agregarImagenCategoria(req: Request, res: Response) {
  const { id: idCategoria } = req.params;

  if (!idCategoria) {
    return res.status(400).json({
      code: 400,
      message: 'Faltan datos obligatorios: idCategoria. Verifique e intente nuevamente.',
    });
  }

  try {
    // const url = await uploadImages({

    // });
    const url = [''];
    const categoriaRef = firebase.db.collection(FIREBASE_COLLECTION_NAMES.categorias).doc(idCategoria);


    await categoriaRef.update({
      imagenUrl: url[0],
      updatedAt: new Date(),
      updatedBy: req.usuario ? req.usuario.nombre : 'admin',
    });

    res.status(200).json({
      code: 200,
      message: 'Imagen de categoría agregada correctamente',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: 'Error al subir la imagen de la categoría: ' + error,
    });
  }

}
