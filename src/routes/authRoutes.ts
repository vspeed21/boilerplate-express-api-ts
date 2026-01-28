import { Router } from 'express';
import { logInUser, signUpUser } from '../controllers/authControllers';

const router = Router();

router.post('/signup', signUpUser);
router.post('/login', logInUser);

export default router;
