import express from 'express';
import { registrarHostCompletoController } from '../../src/controllers//authRegistroHost/registroHost.controller';
import { requireAuth } from '../../src/middlewares/authMiddleware';
import upload from '../../src/middlewares/upload';

const router = express.Router();

router.post(
  '/registro-host',
  requireAuth,
  upload.fields([
    { name: 'imagenes', maxCount: 6 },
    { name: 'qrImage', maxCount: 1 },
  ]),
  registrarHostCompletoController
);

export default router;
