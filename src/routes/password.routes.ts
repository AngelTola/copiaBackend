import { Router } from 'express';
import { recoverPassword } from '../controllers/authRecuperarContraseña/passwordController';
import { resetPassword } from '../controllers/authRecuperarContraseña/resetPasswordController';
import { verifyCode } from '@/controllers/authRecuperarContraseña/verifyCodeController';


const router = Router();

router.post('/recover-password', recoverPassword);
router.post('/verify-code', verifyCode);
router.post('/reset-password', resetPassword);

export default router;

