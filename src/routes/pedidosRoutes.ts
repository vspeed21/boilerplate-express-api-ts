import { Router } from 'express';
import { crearPedido, getPedidosById, getPedidosByUidEmprendedor } from '../controllers/pedidosControllers';
import checkAuth from '../middlewares/checkAuth';

const router = Router();

router.post('/', checkAuth, crearPedido);
router.get('/', checkAuth, getPedidosByUidEmprendedor);
router.get('/:id', checkAuth, getPedidosById);

export default router;
