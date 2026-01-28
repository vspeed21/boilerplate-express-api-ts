import firebase from '../firebase';
import path from 'path';

interface Props {
  archivo?: Express.Multer.File,
  imagenBase64: string
  tipo: 'productos' | 'categorias'
  nombre?: string
  idProducto?: string
  usuario?: string
}

export async function uploadImages({
  imagenBase64,
  tipo,
  nombre,
  idProducto,
  usuario,
}: Props): Promise<string> {

  const mimeMatch2 = imagenBase64.match(/data:(image\/\w+);base64/);
  const mimeType = mimeMatch2 ? mimeMatch2[1] : 'image/png';
  const extension = mimeType.split('/')[1];

  const nombreArchivo = tipo === 'categorias'
    ? `${tipo}/${nombre}.${extension}`
    : `${tipo}/${usuario}/${idProducto}/${nombre}.${extension}`;


  // const archivoSubido = firebase.storage.file(nombreArchivo);

  // await archivoSubido.save(archivo.buffer, {
  //   metadata: {
  //     contentType: archivo.mimetype,
  //   },
  // });

  const base64String = imagenBase64.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64String, 'base64');

  // Detectar el tipo MIME desde el base64 original
  const mimeMatch = imagenBase64.match(/data:(.*);base64/);
  const contentType = mimeMatch ? mimeMatch[1] : 'image/png';

  const archivoSubido = firebase.storage.file(nombreArchivo);

  await archivoSubido.save(buffer, {
    metadata: {
      contentType,
    },
  });

  const url = await archivoSubido.getSignedUrl({
    action: 'read',
    expires: '03-09-2491',
  });

  console.log(url);

  return url[0];
}

export async function deleteImages(filePath: string): Promise<void> {
  const file = firebase.storage.file(filePath);

  // Verificar si existe
  const [exists] = await file.exists();
  if (!exists) {
    console.log('El archivo no existe en Storage:', filePath);
    throw new Error('El archivo no existe en Storage');
  }

  // Eliminar el archivo
  await file.delete();
}
