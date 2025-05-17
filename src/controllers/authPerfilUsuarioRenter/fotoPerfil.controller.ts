// src/controllers/authPerfilUsuario/fotoPerfil.controller.ts

import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { id_usuario, nombre_completo } = req.user as { id_usuario: number, nombre_completo: string };
    // Limpia el nombre para que no tenga espacios ni caracteres raros
    const nombreCarpeta = nombre_completo.trim().replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
    const folderPath = path.join(process.cwd(), 'uploads', `Foto_de_perfil_${id_usuario}_${nombreCarpeta}`);
    // Crea la carpeta si no existe
    fs.mkdirSync(folderPath, { recursive: true });
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Formato de imagen no válido. Usa PNG.'));
    }
    cb(null, true);
  }
});

export const uploadProfilePhoto = async (req: Request, res: Response) => {
  const { id_usuario, nombre_completo } = req.user as { id_usuario: number, nombre_completo: string };
  if (!req.file) {
    res.status(400).json({ message: 'No se subió ninguna imagen.' });
    return;
  }
  //const imagePath = `/uploads/${req.file.filename}`;
  const nombreCarpeta = nombre_completo.trim().replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
  const folderUrl = `/uploads/Foto_de_perfil_${id_usuario}_${nombreCarpeta}`;
  const imagePath = `${folderUrl}/${req.file.filename}`;
  try {
    await prisma.usuario.update({
      where: { id_usuario },
      data: { foto_perfil: imagePath },
    });

    res.json({
      message: 'Foto de perfil actualizada exitosamente.',
      foto_perfil: imagePath
    });
  } catch (error) {
    console.error('Error al guardar la foto de perfil:', error);
    res.status(500).json({ message: 'Error al actualizar la foto de perfil.' });
  }
};

//eliminar foto de perfil
export const deleteProfilePhoto = async (req: Request, res: Response): Promise<void> => {
  const { id_usuario } = req.user as { id_usuario: number };

  try {
    const user = await prisma.usuario.findUnique({
      where: { id_usuario },
      select: { foto_perfil: true }
    });

    if (!user || !user.foto_perfil) {
      res.status(400).json({ message: 'No hay foto para eliminar.' });
      return;
    }

    const filePath = path.join(process.cwd(), user.foto_perfil);

    // ✅ 1. Elimina la foto física si existe
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error eliminando el archivo:', err);
      } else {
        console.log('✅ Foto eliminada del servidor:', filePath);
    
        // ✅ 2. Si la carpeta queda vacía, la eliminamos
        const userFolder = path.dirname(filePath);
        fs.readdir(userFolder, (err, files) => {
          if (!err && files.length === 0) {
            fs.rmdir(userFolder, (err) => {
              if (err) console.error('Error eliminando carpeta vacía:', err);
            });
          }
        });
      }
    });

    // ✅ 2. Borra la referencia en la base de datos
    await prisma.usuario.update({
      where: { id_usuario },
      data: { foto_perfil: null },
    });

    res.json({ message: 'Foto de perfil eliminada exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar la foto de perfil:', error);
    res.status(500).json({ message: 'Error al eliminar la foto.' });
  }
};
