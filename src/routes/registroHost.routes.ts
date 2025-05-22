import express from 'express';
import { registrarHostCompletoController } from '@/controllers/authRegistroHost/registroHostController';
import { requireAuth } from '@/middlewares/authMiddleware';
import upload from '@/middlewares/upload';
import { wrapMiddleware } from '../utils/wrapMiddleware';

const router = express.Router();

router.post(
  '/registro-host',
  requireAuth,
  wrapMiddleware(
    upload.fields([
      { name: 'imagenes', maxCount: 6 },
      { name: 'qrImage', maxCount: 1 },
    ])
  ),
  registrarHostCompletoController
);

export default router;

