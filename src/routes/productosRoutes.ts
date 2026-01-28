import { Router } from 'express';
import { getProductosByCategoria, createProducto, updateProducto, agregarImagenProducto, deleteImagenesProducto, getProductoById } from '../controllers/productosControllers';
import multer from 'multer';
import checkAuth from '../middlewares/checkAuth';

const router = Router();

router.get('/', getProductosByCategoria);
router.post('/', checkAuth, createProducto);

router.route('/:id')
  .get(getProductoById)
  .put(checkAuth, updateProducto);


router.put('/:id/subir-imagen', checkAuth, agregarImagenProducto);
router.delete('/:id/eliminar-imagen', checkAuth, deleteImagenesProducto);


export default router;
