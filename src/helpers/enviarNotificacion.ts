import firebase from '../firebase';


async function enviarNotificacion(token: string) {
  try {
    await firebase.messaging.send({
      token,
      notification: {
        title: '¡NUEVO PEDIDO!',
        body: 'Tienes un nuevo pedido por realizar',
      },
      data: {
        url: '/pedidos/mis-pedidos',
      }
    });
  } catch (error) {
    console.log(error);
    console.log('ERROR durante el envio de notificaciones al emprendedor');
  }
}

export default enviarNotificacion;
