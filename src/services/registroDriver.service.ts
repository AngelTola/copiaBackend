import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const registrarDriverCompleto = async (data: {
  idUsuario: number;
  sexo: string;
  telefono: string;
  licencia: string;
  tipoLicencia: string;
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
    tipoLicencia,
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

  return await prisma.$transaction(async (tx) => {
    const nuevoDriver = await tx.driver.create({
      data: {
        idUsuario,
        sexo,
        telefono: telefonoFinal,
        licencia,
        tipoLicencia,
        fechaEmision,
        fechaExpiracion,
        anversoUrl,
        reversoUrl
      }
    });

    if (!usuario?.telefono) {
      await tx.usuario.update({
        where: { idUsuario },
        data: { telefono }
      });
    }

    await tx.usuario.update({
      where: { idUsuario },
      data: { driverBool: true }
    });
    
    const relacionesDriver = await Promise.all(
      rentersIds.map((renterId) =>
        tx.usuarioDriver.create({
          data: {
            idUsuario: renterId,
            idDriver: nuevoDriver.idDriver
          }
        })
      )
    );

    return {
      driver: nuevoDriver,
      relaciones: relacionesDriver
    };
  });
};
 

