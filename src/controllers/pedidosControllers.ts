/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import firebase from '../firebase';
import { FIREBASE_COLLECTION_NAMES } from '../constants';
import generateId from '../helpers/generarId';
import enviarNotificacion from '../helpers/enviarNotificacion';

export async function crearPedido(req: Request, res: Response) {
  const { productos, direccion, total, descuento, subtotal, envio, totalfinal, medio_pago } = req.body;
  const fechaEntrega = new Date();
  const DIAS_ENTREGA = 3;
  fechaEntrega.setDate(fechaEntrega.getDate() + DIAS_ENTREGA);

  try {
    // Crear pedido
    const pedidoRef = firebase.db.collection(FIREBASE_COLLECTION_NAMES.pedidos);
    const usuarioCarrito = await firebase.db.collection(FIREBASE_COLLECTION_NAMES.carritos).where('uid', '==', req.usuario.uid).get();
    const carritoDoc = firebase.db.collection(FIREBASE_COLLECTION_NAMES.carritos).doc(usuarioCarrito.docs[0].id);

    productos.map(async (pro: any) => {
      // Rebajar stock de los productos
      const productoRef = await firebase.db.collection(FIREBASE_COLLECTION_NAMES.productos)
        .where('userUid', '==', pro.userUid)
        .where('id', '==', pro.id)
        .get();

      const productoDoc = firebase.db.collection(FIREBASE_COLLECTION_NAMES.productos).doc(pro.id);
      const proFirebase = productoRef.docs[0].data();

      await productoDoc.update({
        stock: proFirebase.stock - pro.cantidad,
      });
      // Enviar notificaciones al emprendedor sobre nuevo pedido.
      // - Obtener datos del emprendedor como el tokenNotification y enviar notificacion con firebase push notification
      // const emprendedor = await firebase.db.collection(FIREBASE_COLLECTION_NAMES.usuarios).where('uid', '==', pro.userUid).get();

      // const token = emprendedor.docs[0].data().token;

      // enviarNotificacion(token);

    });

    await pedidoRef.add({
      id_pedido: generateId(),
      createdAt: new Date(),
      productos,
      direccion,
      total,
      descuento,
      subtotal,
      envio: envio ? envio : 150,
      totalfinal,
      medio_pago: medio_pago ? medio_pago : 'tarjeta',
      uid: req.usuario.uid,
      estado: 'PENDIENTE',
      delivery: '',
      cliente: {
        nombre: req.usuario.nombre,
        uid: req.usuario.uid,
      },
      fecha_entrega: fechaEntrega,
    });

    await carritoDoc.update({
      productos: [],
      total: 0,
      descuento: 0,
      totalfinal: 0,
    });

    res.status(200).json({
      code: 200,
      message: 'Pedido creado correctamente',
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: 'Se produjo un error al crear pedido' + error,
    });
  }

}

export async function getPedidosByUidEmprendedor(req: Request, res: Response) {
  try {
    const pedidoRef = await firebase.db.collection(FIREBASE_COLLECTION_NAMES.pedidos).get();

    // Aqui abajo filtramos los productos agrupados por el id del pedido, de manera de devolver la informacion del pedido
    // Y tambien de los productos segun el tipo de usuario (comprador | emprendedor)
    if (req.usuario.tipo === 'emprendedor') {
      const pedidos = pedidoRef.docs.map((doc) => {
        const data = doc.data();
        const productos = data.productos || [];

        // Filtramos los productos del pedido que correspondan al usuario logueado
        const productosFiltradosEmprendedor = productos.filter(
          (producto: any) => producto.userUid === req.usuario.uid
        );

        return {
          id_pedido: doc.id,
          total_por_emprendedor: productosFiltradosEmprendedor.reduce((acc: number, pro: any) => acc + (pro.precio - pro.descuento), 0),
          ...data,
          productos: productosFiltradosEmprendedor,
        };
        return null;
      }).filter((pedido) => pedido !== null);
      res.json({
        cantidad: pedidos.length,
        pedidos: pedidos,
      });
      return;
    }

    // Cuando tipo === comprador aplicar los siguientes filtros

    const pedidos = pedidoRef.docs.filter((doc) => doc.data().uid == req.usuario.uid);

    res.json({
      cantidad: pedidos.length,
      pedidos: pedidos.map(ped => ped.data()),
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: 'Se produjo un error al obtener los pedidos: ' + error,
    });
  }
}

export async function getPedidosById(req: Request, res: Response) {

  const { id } = req.params;

  try {
    const pedidoDoc = await firebase.db.collection(FIREBASE_COLLECTION_NAMES.pedidos).where('id_pedido', '==', id).get();

    if (pedidoDoc.docs.length == 0) {
      res.status(404).json({
        code: 404,
        message: 'No se encontro el pedido con el id proporcionado',
      });
      return;
    }

    const pedidos = pedidoDoc.docs[0].data()?.productos.filter((pro: any) => pro.userUid == req.usuario.uid);
    const pedido = pedidoDoc.docs[0].data();

    res.json({
      pedidos: [{
        ...pedido,
        productos: pedidos,
      }]
    });


  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: 'Se produjo un error al obtener los pedidos' + error,
    });
  }
}
