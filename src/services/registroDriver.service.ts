import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const registrarDriverCompleto = async (data: {
  idUsuario: number;
  sexo: string;
  telefono: string;
  licencia: string;
  categoria: string;
  fechaEmision: Date;
  fechaExpiracion: Date;
  anversoUrl: string;
  reversoUrl: string;
  rentersIds: number[];
}) => {
  const {
    idUsuario,
    sexo,
    telefono,
    licencia,
    categoria,
    fechaEmision,
    fechaExpiracion,
    anversoUrl,
    reversoUrl,
    rentersIds
  } = data;

  if (!rentersIds || rentersIds.length === 0) {
    throw new Error('Debes asignar al menos un renter al driver.');
  }

  // Verificar si el usuario ya tiene teléfono registrado
  const usuario = await prisma.usuario.findUnique({
    where: { idUsuario },
    select: { telefono: true }
  });

  const telefonoFinal = usuario?.telefono ? String(usuario.telefono) : telefono;

  return await prisma.$transaction([
    // 1. Crear al driver
    prisma.driver.create({
      data: {
        idUsuario,
        sexo,
        telefono: telefonoFinal,
        licencia,
        categoria,
        fechaEmision,
        fechaExpiracion,
        anversoUrl,
        reversoUrl
      }
    }),

    // 2. Si no tenía teléfono, actualizarlo ahora
    ...(usuario?.telefono
      ? [] // ya tiene, no actualizamos
      : [
          prisma.usuario.update({
            where: { idUsuario },
            data: { telefono }
          })
        ]),

    // 3. Marcar al usuario como driver (driverBool = true)
    prisma.usuario.update({
      where: { idUsuario },
      data: { driverBool: true }
    }),

    // 4. Asignar renters
    ...rentersIds.map((renterId) =>
      prisma.usuario.update({
        where: { idUsuario: renterId },
        data: {
          assignedToDriver: idUsuario
        }
      })
    )
  ]);
};
 

