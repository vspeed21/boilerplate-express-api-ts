/* eslint-disable @typescript-eslint/no-explicit-any */

import { Request, Response } from 'express';
import firebase from '../firebase';
import { FIREBASE_COLLECTION_NAMES } from '../constants';

export async function getCarrito(req: Request, res: Response) {

  try {
    const carritoRef = await firebase.db.collection(FIREBASE_COLLECTION_NAMES.carritos)
      .where('uid', '==', req.usuario.uid)
      .get();

    console.log(carritoRef.docs[0]);
    const carrito = carritoRef.docs[0].data();

    res.status(200).json({
      code: 200,
      message: 'Productos del carrito obtenidos correctamente',
      total: carrito.total,
      envio: carrito.envio,
      descuento: carrito.descuento,
      subtotal: carrito.subtotal,
      totalfinal: carrito.totalfinal,
      productos: carrito.productos,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Se produjo un error al obtener los items del carrito' + error,
    });
  }
}

export async function agregarProductosCarrito(req: Request, res: Response) {
  const ENVIO = 100;
  const { id, nombre_producto, precio, descuentoprc, precio_oferta, imagenUrl, cantidad, descripcion, userUid, descuento: desc } = req.body;

  // if (!id || !nombre_producto || !precio || descuento < 0 || precio_oferta < 0 || !imagenUrl || !cantidad) return;

  try {
    // Instancia del carrito segun el usuario logueado
    const carritoRef = await firebase.db.collection(FIREBASE_COLLECTION_NAMES.carritos).where('uid', '==', req.usuario.uid).get();

    // Instancia del documento global del carrito
    const carritoDoc = firebase.db.collection(FIREBASE_COLLECTION_NAMES.carritos).doc(carritoRef.docs[0].id);

    const carrito = carritoRef.docs[0].data().productos as Array<any>;

    const productoExiste = carrito.find(item => item.id == id);

    const newCarritoObj = {
      id, nombre_producto, precio, descuento: desc, precio_oferta, cantidad, imagenUrl, descripcion,
      descuentoprc: descuentoprc ? descuentoprc : 0, userUid: userUid ? userUid : ''
    };

    if (productoExiste) {
      // Aumentar la cantidad
      productoExiste.cantidad = productoExiste.cantidad + cantidad;
    }

    // Filtrar por el id para que devuelva aquellos productos distintos al id que se esta intentando guardar
    const carritoFilter = carrito.filter(carr => carr.id != id);

    // Valiacion que si el producto existe, se agrega ese producto con la cantidad sumada si no se crea un nuevo objeto de carrito
    const productoAgregado = productoExiste ? productoExiste : newCarritoObj;

    const newCarrito = [
      ...carritoFilter,
      productoAgregado
    ];

    // const subtotal = newCarrito.reduce((acc: number, producto: any) => {
    //   const precioFinal = producto.precio_oferta != 0 ? producto.precio_oferta : producto.precio;
    //   return acc + precioFinal * producto.cantidad;
    // }, 0);

    const sumaPrecio: number = newCarrito.reduce((acc: number, producto: any) => acc + producto.precio * producto.cantidad, 0);
    const descuento: number = newCarrito.reduce((acc: number, producto: any) => acc + producto.descuento * producto.cantidad, 0);

    const subtotal = sumaPrecio - descuento;

    await carritoDoc.update({
      total: sumaPrecio,
      subtotal,
      envio: ENVIO,
      totalfinal: subtotal + ENVIO,
      descuento,
      productos: newCarrito,
    });

    res.status(200).json({
      code: 200,
      message: 'Producto agregado al carrito correctamente',
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Se produjo un error al agregar los items del carrito: ',
      error
    });
  }
}

export async function eliminarProductoCarrito(req: Request, res: Response) {
  const ENVIO = 200;
  const { id } = req.params;

  try {
    const carritoRef = await firebase.db.collection(FIREBASE_COLLECTION_NAMES.carritos).where('uid', '==', req.usuario.uid).get();
    const carritoDoc = firebase.db.collection(FIREBASE_COLLECTION_NAMES.carritos).doc(carritoRef.docs[0].id);
    const carrito = carritoRef.docs[0].data();

    const newCarrito = carrito.productos.filter((pro: any) => pro.id != id);

    const sumaPrecio: number = newCarrito.reduce((acc: number, producto: any) => acc + producto.precio * producto.cantidad, 0);
    const descuento: number = newCarrito.reduce((acc: number, producto: any) => acc + producto.descuento * producto.cantidad, 0);

    const subtotal = sumaPrecio - descuento;

    await carritoDoc.update({
      total: sumaPrecio,
      subtotal,
      envio: ENVIO,
      totalfinal: subtotal + ENVIO,
      descuento,
      productos: newCarrito,
    });

    res.status(200).json({
      code: 200,
      message: 'Producto eliminado correctamente',
      newCarrito,
      newTotal: sumaPrecio,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: 'Se producto un error al eliminar el producto del carrito: ' + error,
    });
  }

}


