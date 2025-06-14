
import { PrismaClient } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export async function autocompletarAeropuertoService(q: string) {
  const resultados = await prisma.ubicacion.findMany({
    where: {
      tipo: 'AEROPUERTO',
      nombre: {
        contains: q,
        mode: 'insensitive',
      },
      esActiva: true,
    },
    take: 15,
    orderBy: {
      nombre: 'asc',
    },
  });

  return resultados.map((ubicacion) => ({
    idUbicacion: ubicacion.idUbicacion,
    nombre: ubicacion.nombre,
    latitud: ubicacion.latitud,
    longitud: ubicacion.longitud,
  }));
}
