export const FIREBASE_COLLECTION_NAMES = {
  usuarios: 'usuarios',
  categorias: 'categorias',
  productos: 'productos',
  carritos: 'carritos',
  emprendimientos: 'emprendimientos',
  pedidos: 'pedidos',
};

export interface Usuario {
  email: string
  nombre: string
  password: string
  tipo: 'comprador' | 'emprendedor'
  uid: string
  createdAt: Date
  updatedAt: Date
}

export interface Categoria {
  nombre: string
  imagenUrl: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
}

export interface Producto {
  categoria: string
  descuento: number
  createdAt: Date
  createdBy: string
  descripcion: string
  descuentoprc: number
  imagenUrl1: string
  imagenUrl2: string
  imagenUrl3: string
  nombre: string
  precio: number
  precio_oferta: number
  stock: number
  updatedAt: Date
  updatedBy: string
  userUid: string
}
