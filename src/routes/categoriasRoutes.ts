import { Router } from 'express';
import { createCategoria, deleteImagenCategoria, getCategoriaById, getCategorias, updateCategoria, agregarImagenCategoria } from '../controllers/categoriasControllers';
import multer from 'multer';
import checkAuth from '../middlewares/checkAuth';


const router = Router();

router.get('/', getCategorias);
router.post('/', checkAuth, createCategoria);


router.route('/:id')
  .get(checkAuth, getCategoriaById)
  .put(checkAuth, updateCategoria);

router.delete('/:id/eliminar-imagen', checkAuth, deleteImagenCategoria);
router.put('/:id/subir-imagen', checkAuth, multer().single('imagen'), agregarImagenCategoria);




export default router;
