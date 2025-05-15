import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Registra un nuevo driver y asigna una lista de renters.
 * @param data Datos del driver + lista de IDs de renters
 */
export const registrarDriverCompleto = async (data: {
  id_usuario: number;
  sexo: string;
  telefono: string;
  nro_licencia: string;
  categoria: string;
  fecha_emision: Date;
  fecha_vencimiento: Date;
  anversoUrl: string;
  reversoUrl: string;
  rentersIds: number[]; // IDs de usuarios que serán renters de este driver
}) => {
  const {
    id_usuario,
    sexo,
    telefono,
    nro_licencia,
    categoria,
    fecha_emision,
    fecha_vencimiento,
    anversoUrl,
    reversoUrl,
    rentersIds
  } = data;

  if (!rentersIds || rentersIds.length === 0) {
    throw new Error('Debes asignar al menos un renter al driver.');
  }

  return await prisma.$transaction([
    // 1. Crear al driver con sus datos
    prisma.driver.create({
      data: {
        id_usuario,
        sexo,
        telefono,
        nro_licencia,
        categoria,
        fecha_emision,
        fecha_vencimiento,
        anversoUrl,
        reversoUrl
      }
    }),

    // 2. Actualizar cada renter para asignarlo a este driver
    ...rentersIds.map((renterId) =>
      prisma.usuario.update({
        where: { id_usuario: renterId },
        data: {
          assignedToDriver: id_usuario
        }
      })
    )
  ]);
};

