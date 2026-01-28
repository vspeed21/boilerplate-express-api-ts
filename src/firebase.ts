import dotenv from 'dotenv';
dotenv.config();
import { applicationDefault, initializeApp } from 'firebase-admin/app';

// Modulos a utilizar
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import { getMessaging } from 'firebase-admin/messaging';


// Inicializar app
initializeApp({
  // `aplicacionDefault()` buscara la variable de entorno con la ruta del archivo .json y hacer la conexion
  credential: applicationDefault(),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,

});

const db = getFirestore();
const storage = getStorage().bucket(process.env.FIREBASE_STORAGE_BUCKET);
const auth = getAuth();
const messaging = getMessaging();



export default {
  db,
  storage,
  auth,
  messaging
};
