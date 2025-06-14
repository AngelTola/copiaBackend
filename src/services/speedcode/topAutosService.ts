import { PrismaClient } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export const obtenerTopAutos = async () => {
  const autos = await prisma.auto.findMany({
    orderBy: {
      calificacionPromedio: 'desc',
    },
    take: 5,
    select: {
      idAuto: true,
      marca: true,
      modelo: true,
      descripcion: true,
      precioRentaDiario: true,
      calificacionPromedio: true,
      imagenes: {
        take: 1,
        select: {
          direccionImagen: true,
        },
      },
    },
  });

  return autos.map(auto => ({
    id: auto.idAuto,
    nombre: `${auto.marca}-${auto.modelo}`,
    descripcion: auto.descripcion,
    tarifa: auto.precioRentaDiario,
    calificacion: auto.calificacionPromedio,
    imagen: auto.imagenes[0]?.direccionImagen || null,
  }));
};
