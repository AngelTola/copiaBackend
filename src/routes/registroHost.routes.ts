import express from 'express';
import { registrarHostCompletoController } from '../../src/controllers/authRegistroHost/registroHost.controller';
import { requireAuth } from '../../src/middlewares/authMiddleware';
import upload, { uploadToCloudinary } from '../../src/middlewares/upload';

const router = express.Router();

router.post(
  '/registro-host',
  requireAuth,
  upload.fields([
    { name: 'imagenes', maxCount: 6 },
    { name: 'qrImage', maxCount: 1 },
  ]),
  uploadToCloudinary,
  registrarHostCompletoController
);

export default router;