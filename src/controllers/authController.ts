import { PrismaClient } from "@prisma/client"
import type { Request, Response } from "express"
import * as authService from "@/services/auth.service"
import { generateToken } from "@/utils/generateToken"

import multer from "multer"
import path from "path"
import fs from "fs"

const prisma = new PrismaClient()

export const register = async (req: Request, res: Response) => {
  const { nombre, apellido, email, contraseña, fechaNacimiento, telefono } = req.body

  try {
    const existingUser = await authService.findUserByEmail(email)
    if (existingUser) {
      res.status(400).json({ message: "El correo electrónico ya está registrado." })
      return
    }

    const newUser = await authService.createUser({
      nombre,
      apellido,
      email,
      contraseña,
      fechaNacimiento,
      telefono,
    })

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: { email: newUser.email },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

export const updateGoogleProfile = async (req: Request, res: Response) => {
  const { nombre, apellido, fechaNacimiento, telefono } = req.body
  const email = req.body.email // Obtener email del body, no del user

  if (!email) {
    res.status(401).json({ message: "Email no proporcionado" })
    return
  }

  console.log(`📝 Actualizando perfil de Google para: ${email}`)

  try {
    const updatedUser = await authService.updateGoogleProfile(email, nombre, apellido, fechaNacimiento)

    // Generar token para el usuario actualizado
    const token = generateToken({
      idUsuario: updatedUser.idUsuario,
      email: updatedUser.email,
      nombreCompleto: updatedUser.nombre + " " + updatedUser.apellido,
    })

    res.json({
      message: "Perfil actualizado correctamente",
      token,
      user: {
        email: updatedUser.email,
        nombreCompleto: updatedUser.nombre + " " + updatedUser.apellido,
      },
    })
  } catch (error: any) {
    console.error("Error al actualizar perfil:", error)
    res.status(400).json({
      message: error.message || "No se pudo actualizar el perfil con Google",
    })
  }
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await authService.findUserByEmail(email);

    if (!user) {
      res.status(401).json({ message: "Correo ingresado no se encuentra en el sistema." });
      return;
    }

    if (user.registradoCon === "google") {
      res.status(401).json({
        message: "Esta cuenta fue registrada con Google. Por favor, inicia sesión con Google.",
      });
    }

    const isValid = await authService.validatePassword(password, user.contraseña ?? "");

    if (!isValid) {
      res.status(401).json({ message: "Datos invalidos" });
      return;
    }

    // Token
    const token = generateToken({
      idUsuario: user.idUsuario,
      email: user.email,
      nombreCompleto: user.nombre + " " + user.apellido
    });

    console.info("Login exitoso para usuario:", email);
    res.json({
      message: "Login exitoso",
      token,
      user: {
        email: user.email,
        nombreCompleto: user.nombre + " " + user.apellido,
      },
    });
  } catch (error) {
    console.error("Error inesperado en login:", error);
    res.status(500).json({ message: "Error en el servidor" });
    return;
  }
};

export const me = async (req: Request, res: Response) => {
  const { idUsuario } = req.user as { idUsuario: number }

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
        edicionesNombre: true,
        edicionesTelefono: true,
        edicionesFecha: true,
        driverBool: true,
        host: true,
      },
    })

    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" })
      return
    }

    res.json({ user })
  } catch (error) {
    console.error("Error en /me:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}-${file.fieldname}${ext}`)
  },
})

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/png"]
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Formato de imagen no válido. Usa PNG."))
    }
    cb(null, true)
  },
})

export const uploadProfilePhoto = async (req: Request, res: Response) => {
  const { idUsuario } = req.user as { idUsuario: number }

  if (!req.file) {
    res.status(400).json({ message: "No se subió ninguna imagen." })
    return
  }

  const imagePath = `/uploads/${req.file.filename}`

  try {
    await prisma.usuario.update({
      where: { idUsuario },
      data: { fotoPerfil: imagePath },
    })

    res.json({
      message: "Foto de perfil actualizada exitosamente.",
      foto_perfil: imagePath,
    })
  } catch (error) {
    console.error("Error al guardar la foto de perfil:", error)
    res.status(500).json({ message: "Error al actualizar la foto de perfil." })
  }
}

export const deleteProfilePhoto = async (req: Request, res: Response) => {
  const { idUsuario } = req.user as { idUsuario: number }

  try {
    const user = await prisma.usuario.findUnique({
      where: { idUsuario },
      select: { fotoPerfil: true },
    })

    if (!user || !user.fotoPerfil) {
      res.status(400).json({ message: "No hay foto para eliminar." })
      return
    }

    const filePath = path.join(__dirname, "../../", user.fotoPerfil)

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error eliminando el archivo:", err)
      } else {
        console.log("✅ Foto eliminada del servidor:", filePath)
      }
    })

    await prisma.usuario.update({
      where: { idUsuario },
      data: { fotoPerfil: null },
    })

    res.json({ message: "Foto de perfil eliminada exitosamente." })
  } catch (error) {
    console.error("Error al eliminar la foto de perfil:", error)
    res.status(500).json({ message: "Error al eliminar la foto." })
  }
}

export const updateUserField = async (req: Request, res: Response) => {
  const { campo, valor }: { campo: CampoEditable; valor: string } = req.body;
  const { idUsuario } = req.user as { idUsuario: number };

  if (!campo || !valor) {
     res.status(400).json({ message: 'Campo y valor son obligatorios.' });
  }

  const camposPermitidos = ['nombre_completo', 'telefono', 'fecha_nacimiento'] as const;
  type CampoEditable = typeof camposPermitidos[number];
  if (!camposPermitidos.includes(campo)) {
     res.status(400).json({ message: 'Campo no permitido.' });
  }

  const campoContadorMap: Record<CampoEditable, keyof Usuario> = {
    nombre_completo: 'ediciones_nombre',
    telefono: 'ediciones_telefono',
    fecha_nacimiento: 'ediciones_fecha',
  };
  const campoContador = campoContadorMap[campo];

  try {
    const user = await prisma.usuario.findUnique({
      where: { idUsuario },
      select: {
        [campo]: true,
        [campoContador]: true,
      },
    }) as any;

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (user[campoContador] >= 3) {
      return res.status(403).json({ message: 'Has alcanzado el límite de 3 ediciones para este campo. Para más cambios, contacta al soporte.' });
    }

    const valorActual = user[campo];
    const nuevoValor = campo === 'telefono' ? parseInt(valor, 10) : campo === 'fecha_nacimiento' ? new Date(valor) : valor;

    if (valorActual?.toString() === nuevoValor?.toString()) {
      return res.status(200).json({
        message: 'No hubo cambios en el valor.',
        edicionesRestantes: 3 - user[campoContador]
      });
    }

    // Validaciones personalizadas
    if (campo === 'nombre_completo') {
      if (typeof valor !== 'string' || valor.length < 3 || valor.length > 50) {
        return res.status(400).json({ message: 'El nombre debe tener entre 3 y 50 caracteres.' });
      }
      const soloLetrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
      if (!soloLetrasRegex.test(valor)) {
        return res.status(400).json({ message: 'El nombre solo puede contener letras y espacios.' });
      }
      if (/\s{2,}/.test(valor)) {
        return res.status(400).json({ message: 'El nombre no debe tener más de un espacio consecutivo.' });
      }
      if (/^\s|\s$/.test(valor)) {
        return res.status(400).json({ message: 'El nombre no debe comenzar ni terminar con espacios.' });
      }
    }

    if (campo === 'telefono') {
      const telefonoStr = valor.toString();
      if (!/^[0-9]*$/.test(telefonoStr)) {
        return res.status(400).json({ message: 'Formato inválido, ingrese solo números.' });
      }
      if (!/^[0-9]{8}$/.test(telefonoStr)) {
        return res.status(400).json({ message: 'El teléfono debe ser un número de 8 dígitos.' });
      }
      if (!/^[67]/.test(telefonoStr)) {
        return res.status(400).json({ message: 'El teléfono debe comenzar con 6 o 7.' });
      }
    }

    if (campo === 'fecha_nacimiento') {
      const fechaValida = Date.parse(valor);
      if (isNaN(fechaValida)) {
        return res.status(400).json({ message: 'Fecha inválida.' });
      }
    }

    const updatedUser = await prisma.usuario.update({
      where: { idUsuario },
      data: {
        [campo]: nuevoValor,
        [campoContador]: { increment: 1 },
      },
    });

    const edicionesRestantes = 2 - user[campoContador];
    let infoExtra = '';
    if (edicionesRestantes === 1) {
      infoExtra = 'Último intento: esta es tu última oportunidad para editar este campo.';
    } else if (edicionesRestantes === 0) {
      infoExtra = 'Has alcanzado el límite de 3 ediciones para este campo. Para más cambios, contacta al soporte.';
    }

    return res.json({
      message: `$${
        campo === 'nombre_completo' ? 'Nombre' :
        campo === 'telefono' ? 'Teléfono' :
        'Fecha de nacimiento'
      } actualizado correctamente`,
      edicionesRestantes,
      infoExtra,
      user: {
        idUsuario: updatedUser.idUsuario,
        [campo]: updatedUser[campo],
        [campoContador]: updatedUser[campoContador],
      },
    });
  } catch (error) {
    console.error('Error al actualizar campo:', error);
     res.status(500).json({ message: 'Error al actualizar el campo.' });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  const idUsuario = Number(req.params.idUsuario)

  if (isNaN(idUsuario)) {
    res.status(400).json({ message: "ID de usuario inválido" })
    return
  }

  try {
    const user = await authService.getUserById(idUsuario)

    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" })
      return
    }

    res.status(200).json({
      idUsuario: user.idUsuario,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono,
      fechaNacimiento: user.fechaNacimiento,
    })
  } catch (error) {
    console.error("Error al obtener el perfil:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

export const checkPhoneExists = async (req: Request, res: Response) => {
  const { telefono } = req.body

  if (!telefono) {
    res.status(400).json({ message: "Teléfono no proporcionado" })
    return
  }

  try {
    const user = await authService.findUserByPhone(telefono.toString())
    res.json({ exists: !!user })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}
