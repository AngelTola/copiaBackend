import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const registrarHostCompleto = async (data: {
  idUsuario: number;
  placa: string;
  soat: string;
  //imagenes: string[];
  tipo: "TARJETA_DEBITO" | "QR" | "EFECTIVO";
  numeroTarjeta?: string;
  fechaExpiracion?: string;
  titular?: string;
  imagenQr?: string;
  detallesMetodoPago?: string;
}) => {
  const { idUsuario, ...resto } = data;

  return await prisma.$transaction([
    prisma.auto.create({
      data: {
        placa: resto.placa,
        soat: resto.soat,
        //imagenes: resto.imagenes,
        propietario: { connect: { idUsuario } },
      },
    }),
    prisma.usuario.update({
      where: { idUsuario },
      data: {
        metodoPago: resto.tipo,
        numeroTarjeta: resto.numeroTarjeta,
        fechaExpiracion: resto.fechaExpiracion,
        titular: resto.titular,
        imagenQr: resto.imagenQr,
        detallesMetodoPago: resto.detallesMetodoPago,
        host: true,
      },
    }),
  ]);
};
