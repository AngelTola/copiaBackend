import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { AuthenticatedRequest } from "../../../middlewares/auth/authDriverMiddleware";

const prisma = new PrismaClient();

// Función para subir imagen a Cloudinary desde un buffer
const uploadToCloudinary = (fileBuffer: Buffer, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result?.secure_url || "");
        }
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export const editarPerfilDriver = async (req: Request, res: Response): Promise<void> => {
  const typedReq = req as AuthenticatedRequest;

  const idUsuario = typedReq.user?.idUsuario;

  if (!idUsuario) {
    res.status(401).json({ message: "No autorizado: token inválido" });
    return;
  }

  try {
    const {
      telefono,
      licencia,
      tipoLicencia,
      fechaEmision,
      fechaExpiracion,
    } = typedReq.body;

    // --- ✅ VALIDACIONES --- //
    const errores: string[] = [];

    // Teléfono: solo números, 8 dígitos, inicia con 6 o 7
    if (!/^[67]\d{7}$/.test(telefono)) {
      errores.push("El teléfono debe tener 8 dígitos numéricos y comenzar con 6 o 7.");
    }

    // Licencia: solo números, entre 6 y 9 dígitos
    if (!/^\d{6,9}$/.test(licencia)) {
      errores.push("La licencia debe tener entre 6 y 9 dígitos numéricos.");
    }

    // Categoría: solo una opción válida
    const categoriasValidas = ['M', 'P', 'T', 'A', 'B', 'C'];
    if (!categoriasValidas.includes(tipoLicencia)) {
      errores.push("La categoría debe ser una de las siguientes: M, P, T, A, B, C.");
    }

    // Fechas: formato válido y reglas cronológicas
    const emision = new Date(fechaEmision);
    const expiracion = new Date(fechaExpiracion);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // reset hora

    if (isNaN(emision.getTime()) || isNaN(expiracion.getTime())) {
      errores.push("Las fechas deben ser válidas.");
    } else {
      if (emision > hoy) {
        errores.push("La fecha de emisión no puede ser mayor a la fecha actual.");
      }
      if (expiracion < hoy) {
        errores.push("La fecha de vencimiento no puede ser menor a la fecha actual.");
      }
      if (emision >= expiracion) {
        errores.push("La fecha de emisión debe ser menor a la fecha de vencimiento.");
      }
    }

    if (errores.length > 0) {
      res.status(400).json({ errores });
      return;
    }

    const files = typedReq.files as { [fieldname: string]: Express.Multer.File[] };
    const anversoFile = files?.["anverso"]?.[0];
    const reversoFile = files?.["reverso"]?.[0];

    const updateData: any = {
      telefono,
      licencia,
      tipoLicencia,
      fechaEmision: new Date(fechaEmision),
      fechaExpiracion: new Date(fechaExpiracion),
    };

    // Subir imágenes a Cloudinary si existen
    if (anversoFile) {
      const url = await uploadToCloudinary(anversoFile.buffer, "Redibo/licencias");
      updateData.anversoUrl = url;
    }

    if (reversoFile) {
      const url = await uploadToCloudinary(reversoFile.buffer, "Redibo/licencias");
      updateData.reversoUrl = url;
    }

    const updatedDriver = await prisma.driver.update({
      where: { idUsuario },
      data: updateData,
      include: { usuario: true }
    });

    res.status(200).json(updatedDriver);
  } catch (error) {
    console.error("❌ Error al actualizar perfil del driver:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};
