import { Router } from 'express';
import checkAuth from '../middlewares/checkAuth';
import { convertirAEmprendedor, saveTokenFCM } from '../controllers/usuariosControllers';

const router = Router();

router.put('/convertir-emprendedor', checkAuth, convertirAEmprendedor);
router.put('/guardar-token', checkAuth, saveTokenFCM);

export default router;
