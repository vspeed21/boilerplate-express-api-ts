import { Router } from 'express';
import { agregarProductosCarrito, eliminarProductoCarrito, getCarrito } from '../controllers/carritoControllers';
import checkAuth from '../middlewares/checkAuth';

const router = Router();

router.get('/', checkAuth, getCarrito);
router.put('/', checkAuth, agregarProductosCarrito);
router.delete('/:id', checkAuth, eliminarProductoCarrito);

export default router;
