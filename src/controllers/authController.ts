import { PrismaClient } from '@prisma/client';
import { Request, Response } from "express";
import * as authService from "@/services/auth.service";
import { generateToken } from '@/utils/generateToken';

import multer from 'multer';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  const { nombre, apellido, email, contraseña, fechaNacimiento, telefono } =
    req.body;

  try {
    const existingUser = await authService.findUserByEmail(email);
    if (existingUser) {
      res
        .status(400)
        .json({ message: "El correo electrónico ya está registrado." });
    }

    const newUser = await authService.createUser({
      nombre,
      apellido,
      email,
      contraseña,
      fechaNacimiento,
      telefono,
    });

    res
      .status(201)
      .json({
        message: "Usuario registrado exitosamente",
        user: { email: newUser.email },
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const updateGoogleProfile = async (req: Request, res: Response) => {
  const { nombre, apellido, fechaNacimiento } = req.body;
  const email = (req.user as { email: string }).email;
  //const email = req.user?.email;

  if (!email) {
    res.status(401).json({ message: "Usuario no autenticado" });
  }

  try {
    const updatedUser = await authService.updateGoogleProfile(email, nombre, apellido, fechaNacimiento);
    res.json({
      message: "Perfil actualizado correctamente",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Error al actualizar perfil:", error);
    res.status(400).json({
      message:
        error.message || "No se pudo actualizar el perfil con Google",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await authService.findUserByEmail(email);

    if (!user) {
      res
        .status(401)
        .json({ message: "Correo ingresado no se encuentra en el sistema." });
      return;
    }

    const isValid = await authService.validatePassword(password, user.contraseña ?? "");

    if (!isValid) {
      res.status(401).json({ message: "Los datos no son válidos" });
    }

    //Token
    const token = generateToken({
      idUsuario: user.idUsuario,
      email: user.email,
      nombreCompleto: (user.nombre + " " + user.apellido)
    });
    res.json({
      message: "Login exitoso",
      token,
      user: {
        email: user.email,
        nombreCompleto: (user.nombre + " " + user.apellido)
      }
    });
    //Cambios por si no funciona lo que implemente
    //return res.json({ message: "Login exitoso", user: { email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const me = async (req: Request, res: Response) => {
  const { idUsuario } = req.user as { idUsuario: number };

  try {
    const user = await prisma.usuario.findUnique({
      where: { idUsuario },
      select: {
        idUsuario: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        fechaNacimiento: true,
        fotoPerfil: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ user }); // 🔥 Ahora manda todos los datos al frontend
  } catch (error) {
    console.error('Error en /me:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
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
  const { idUsuario } = req.user as { idUsuario: number };

  if (!req.file) {
    res.status(400).json({ message: 'No se subió ninguna imagen.' });
    return;
  }

  const imagePath = `/uploads/${req.file.filename}`;

  try {
    await prisma.usuario.update({
      where: { idUsuario },
      data: { fotoPerfil: imagePath },
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
export const deleteProfilePhoto = async (req: Request, res: Response) => {
  const { idUsuario } = req.user as { idUsuario: number };

  try {
    const user = await prisma.usuario.findUnique({
      where: { idUsuario },
      select: { fotoPerfil: true }
    });

    if (!user || !user.fotoPerfil) {
      res.status(400).json({ message: 'No hay foto para eliminar.' });
      return;
    }

    const filePath = path.join(__dirname, '../../', user.fotoPerfil);

    // ✅ 1. Elimina la foto física si existe
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error eliminando el archivo:', err);
        // No hacemos fail solo por esto, seguimos.
      } else {
        console.log('✅ Foto eliminada del servidor:', filePath);
      }
    });

    // ✅ 2. Borra la referencia en la base de datos
    await prisma.usuario.update({
      where: { idUsuario },
      data: { fotoPerfil: null },
    });

    res.json({ message: 'Foto de perfil eliminada exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar la foto de perfil:', error);
    res.status(500).json({ message: 'Error al eliminar la foto.' });
  }
};

export const updateUserField = async (req: Request, res: Response) => {
  const { campo, valor } = req.body;
  const { idUsuario } = req.user as { idUsuario: number };

  if (!campo || !valor) {
    res.status(400).json({ message: 'Campo y valor son obligatorios.' });
  }

  const camposPermitidos = ['nombre_completo', 'telefono'];

  if (!camposPermitidos.includes(campo)) {
    res.status(400).json({ message: 'Campo no permitido.' });
  }

  if (campo === 'nombre_completo') {
    if (typeof valor !== 'string' || valor.length < 3 || valor.length > 50) {
      res.status(400).json({ message: "El nombre debe tener entre 3 y 50 caracteres." });
    }
    const soloLetrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
    if (!soloLetrasRegex.test(valor)) {
      res.status(400).json({ message: "El nombre solo puede contener letras y espacios." });
    }
    if (/\s{2,}/.test(valor)) {
      res.status(400).json({ message: "El nombre no debe tener más de un espacio consecutivo." });
    }
    if (/^\s|\s$/.test(valor)) {
      res.status(400).json({ message: "El nombre no debe comenzar ni terminar con espacios." });
    }
  }

  if (campo === 'telefono') {
    const telefonoStr = valor.toString();

    // ✅ Nueva validación añadida aquí
    if (!/^[0-9]*$/.test(telefonoStr)) {
      res.status(400).json({ message: "Formato inválido, ingrese solo números." });
    }

    if (!/^[0-9]{8}$/.test(telefonoStr)) {
      res.status(400).json({ message: "El teléfono debe ser un número de 8 dígitos." });
    }

    if (!/^[67]/.test(telefonoStr)) {
      res.status(400).json({ message: "El teléfono debe comenzar con 6 o 7." });
    }
  }

  try {
    const updatedUser = await prisma.usuario.update({
      where: { idUsuario },
      data: {
        [campo]: campo === 'telefono' ? parseInt(valor, 10) : valor,
      },
    });

    res.json({
      message: `${campo === 'nombre_completo' ? 'Nombre' : 'Teléfono'} actualizado correctamente`,
      user: {
        id_usuario: updatedUser.idUsuario,
        [campo]: (updatedUser as any)[campo],
      },
    });
  } catch (error) {
    console.error('Error al actualizar campo:', error);
    res.status(500).json({ message: 'Error al actualizar el campo.' });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  const idUsuario = Number(req.params.idUsuario); // Aseguramos que sea número

  if (isNaN(idUsuario)) {
    res.status(400).json({ message: 'ID de usuario inválido' });
    return;
  }

  try {
    const user = await authService.getUserById(idUsuario); // Usamos el servicio

    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    // Devolvemos los datos sin contraseña ni campos sensibles
    res.status(200).json({
      idUsuario: user.idUsuario,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono,
      fecha_nacimiento: user.fechaNacimiento,
    });
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const checkPhoneExists = async (req: Request, res: Response) => {
  const { telefono } = req.body;

  if (!telefono) {
    res.status(400).json({ message: "Teléfono no proporcionado" });
    return;
  }

  try {
    const user = await authService.findUserByPhone(telefono);
    if (user) {
      res.json({ exists: true });
    }
    res.json({ exists: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
