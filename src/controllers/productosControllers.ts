/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import firebase from '../firebase';
import { deleteImages, uploadImages } from '../helpers/uploadImages';
import { FIREBASE_COLLECTION_NAMES, Producto } from '../constants';


export async function getProductosByCategoria(req: Request, res: Response) {
  const { cat } = req.query;

  let querySnapshot;

  try {
    if (cat) {
      querySnapshot = await firebase.db.collection(FIREBASE_COLLECTION_NAMES.productos)
        .where('categoria', '==', cat)
        .where('stock', '>', 0)
        .get();
    } else {
      querySnapshot = await firebase.db.collection(FIREBASE_COLLECTION_NAMES.productos)
        .where('stock', '>', 0)
        .get();
    }

    res.status(200).json({
      code: 200,
      message: querySnapshot.size > 0 ? 'Productos obtenidos correctamente' : 'No se encontraron productos para la categoría seleccionada o están agotados',
      length: querySnapshot.size,
      data: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: 'Error al obtener los productos: ' + error,
    });
  }
}

export async function getProductoById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const doc = await firebase.db.collection(FIREBASE_COLLECTION_NAMES.productos).doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        code: 404,
        message: 'El producto requerido no fue encontrado',
      });
    }
    res.status(200).json({
      code: 200,
      message: 'Producto obtenido correctamente',
      data: { id: doc.id, ...doc.data() },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: 'Error al obtener información del producto: ' + error,
    });
  }
}

export async function createProducto(req: Request, res: Response) {
  const { nombre, descripcion, precio_oferta, descuentoprc, precio, categoria, stock, descuento, imagenUrl1 } = req.body;

  if (req.usuario.tipo != 'emprendedor') {
    return res.status(400).json({
      code: 400,
      error: true,
      message: 'No posee permisos para ejecutar esta opción de crear productos',
    });
  }

  if (!descripcion || !precio || !categoria) {
    return res.status(400).json({
      code: 400,
      message: 'Faltan datos obligatorios para crear el producto',
    });
  }

  try {
    const newProducto: Producto = {
      nombre,
      descuento,
      imagenUrl1: imagenUrl1 ? imagenUrl1 : '',
      imagenUrl2: '',
      imagenUrl3: '',
      descripcion,
      precio,
      precio_oferta: precio_oferta || 0,
      descuentoprc: descuentoprc || 0,
      categoria,
      stock: stock || 0,
      userUid: req.usuario ? req.usuario.uid : 'admin',
      createdBy: req.usuario ? req.usuario.nombre : '',
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: req.usuario ? req.usuario.nombre : '',
    };

    const docRef = await firebase.db.collection(FIREBASE_COLLECTION_NAMES.productos).add(newProducto);
    await docRef.update({
      id: docRef.id,
    });
    res.status(201).json({
      code: 201,
      message: 'Producto creado correctamente',
      data: { id: docRef.id, ...newProducto },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: 'Error al crear el producto' + error,
    });
  }
}

export async function updateProducto(req: Request, res: Response) {
  const { id } = req.params;
  const { nombre, descripcion, precio_oferta, descuentoprc, precio, categoria, descuento } = req.body;


  if (!descripcion || !precio || !categoria) {
    return res.status(400).json({
      code: 400,
      message: 'Faltan datos obligatorios para editar el producto',
    });
  }

  try {
    const productoRef = firebase.db.collection(FIREBASE_COLLECTION_NAMES.productos).doc(id);
    const doc = await productoRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        code: 404,
        message: `No se encontro el producto solicitado con el id proporcionado: '${id}'`,
      });
    }

    const productoEditar: Producto = {
      nombre,
      descuento: descuento ? descuento : doc.data()?.descuento,
      descripcion,
      precio,
      precio_oferta: precio_oferta || 0,
      descuentoprc: descuentoprc || 0,
      categoria,
      stock: doc.data()?.stock,
      imagenUrl1: doc.data()?.imagenUrl1,
      imagenUrl2: doc.data()?.imagenUrl2,
      imagenUrl3: doc.data()?.imagenUrl3,
      createdAt: doc.data()?.createdAt,
      createdBy: doc.data()?.createdBy,
      updatedAt: new Date(),
      updatedBy: req.usuario ? req.usuario.nombre : 'admin',
      userUid: req.usuario ? req.usuario.uid : '12345'
    };

    await productoRef.update({
      ...productoEditar
    });

    res.status(200).json({
      code: 200,
      message: 'Producto actualizado correctamente',
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: 'Error al actualizar el producto' + error,
    });
  }
}

export async function agregarImagenProducto(req: Request, res: Response) {
  const { id: idProducto } = req.params;
  const { imagenNumero, imagen } = req.body;

  if (!idProducto) {
    return res.status(400).json({
      code: 400,
      message: 'Faltan datos obligatorios: idProducto. Verifique e intente nuevamente.',
    });
  }

  try {
    const imagenUrl = await uploadImages({
      imagenBase64: imagen,
      tipo: 'productos',
      idProducto,
      usuario: req.usuario.nombre,
    });

    console.log(imagenUrl[0]);

    const productoRef = firebase.db.collection(FIREBASE_COLLECTION_NAMES.productos).doc(idProducto);

    if (imagenNumero < 1 || imagenNumero > 3) {
      return res.status(500).json({
        code: 400,
        message: 'No es posible agregar mas de 3 imagenes por producto. Verifique e intente nuevamente.',
      });
    }

    if (imagenNumero == 1) {
      await productoRef.update({
        imagenUrl1: imagenUrl,
        updatedAt: new Date(),
        updatedBy: req.usuario ? req.usuario.nombre : 'admin',
      });
    }

    if (imagenNumero == 2) {
      await productoRef.update({
        imagenUrl2: imagenUrl,
        updatedAt: new Date(),
        updatedBy: req.usuario ? req.usuario.nombre : 'admin',
      });
    }

    if (imagenNumero == 3) {
      await productoRef.update({
        imagenUrl3: imagenUrl,
        updatedAt: new Date(),
        updatedBy: req.usuario ? req.usuario.nombre : 'admin',
      });

    }

    res.status(200).json({
      code: 200,
      message: 'Imagen de producto agregado correctamente',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: 'Error al subir la imagen del producto: ' + error,
    });
  }

}

export async function deleteImagenesProducto(req: Request, res: Response) {
  const { imagenNombre, imagenNumero } = req.body;
  const { id: idProducto } = req.params;

  if (!imagenNombre || !idProducto) {
    return res.status(400).json({
      code: 400,
      message: 'Faltan datos obligatorios: imagenNombre y idProducto. Verifique e intente nuevamente.',
    });
  }

  try {
    await deleteImages(`productos/${imagenNombre}`);

    const productoRef = firebase.db.collection(FIREBASE_COLLECTION_NAMES.productos).doc(idProducto);

    if (imagenNumero === 1) {
      await productoRef.update({
        imagenUrl1: '',
        updatedAt: new Date(),
        updatedBy: req.usuario ? req.usuario.nombre : 'admin',
      });
    }

    if (imagenNumero === 2) {
      await productoRef.update({
        imagenUrl2: '',
        updatedAt: new Date(),
        updatedBy: req.usuario ? req.usuario.nombre : 'admin',
      });
    }

    if (imagenNumero === 3) {
      await productoRef.update({
        imagenUrl3: '',
        updatedAt: new Date(),
        updatedBy: req.usuario ? req.usuario.nombre : 'admin',
      });
    }

    res.status(200).json({
      code: 200,
      message: 'Imagen del producto eliminada correctamente',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: 'Error al eliminar la imagen del producto: ' + error,
    });
  }

}

