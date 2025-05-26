import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const registrarHostCompleto = async (data: {
  idUsuario: number;
  // Datos del auto
  placa: string;
  soat: string;
  marca: string;
  modelo: string;
  descripcion: string;
  precioRentaDiario: number;
  montoGarantia: number;
  tipoAuto: string;
  año: number;
  color: string;
  asientos: number;
  capacidadMaletero: number;
  transmision: string;
  combustible: string;
  idUbicacion: number;
  imagenes: string[];
  // Datos de pago
  tipoPago: "TARJETA_DEBITO" | "QR" | "EFECTIVO";
  numeroTarjeta?: string;
  fechaExpiracion?: string;
  cvv?: string;
  titular?: string;
  imagenQr?: string;
  detallesMetodoPago?: string;
}) => {
  const { idUsuario, imagenes, tipoPago, ...restoDatos } = data;

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Crear el auto
      const nuevoAuto = await tx.auto.create({
        data: {
          idPropietario: idUsuario,
          idUbicacion: restoDatos.idUbicacion,
          placa: restoDatos.placa,
          soat: restoDatos.soat,
          marca: restoDatos.marca,
          modelo: restoDatos.modelo,
          descripcion: restoDatos.descripcion,
          precioRentaDiario: restoDatos.precioRentaDiario,
          montoGarantia: restoDatos.montoGarantia,
          tipo: restoDatos.tipoAuto,
          año: restoDatos.año,
          color: restoDatos.color,
          asientos: restoDatos.asientos,
          capacidadMaletero: restoDatos.capacidadMaletero,
          transmision: restoDatos.transmision as any, // Ajustar según tu enum
          combustible: restoDatos.combustible as any,  // Ajustar según tu enum
          kilometraje: 0,
          estado: 'ACTIVO',
        },
        include: {
          imagenes: true,
          propietario: {
            select: { idUsuario: true, nombreCompleto: true, host: true }
          }
        }
      });

      // 2. Crear las imágenes del auto
      if (imagenes && imagenes.length > 0) {
        const imagenesData = imagenes.map(filename => ({
          idAuto: nuevoAuto.idAuto,
          direccionImagen: filename,
        }));

        await tx.imagen.createMany({
          data: imagenesData,
        });
      }

      // 3. Actualizar el usuario como host y agregar método de pago
      const usuarioActualizado = await tx.usuario.update({
        where: { idUsuario },
        data: {
          host: true,
          metodoPago: tipoPago,
          numeroTarjeta: restoDatos.numeroTarjeta,
          fechaExpiracion: restoDatos.fechaExpiracion,
          titular: restoDatos.titular,
          imagenQr: restoDatos.imagenQr,
          detallesMetodoPago: restoDatos.detallesMetodoPago,
        },
        select: {
          idUsuario: true,
          nombreCompleto: true,
          host: true,
          metodoPago: true,
        }
      });

      // 4. Obtener el auto completo con imágenes
      const autoCompleto = await tx.auto.findUnique({
        where: { idAuto: nuevoAuto.idAuto },
        include: {
          imagenes: true,
          ubicacion: {
            select: { nombre: true, descripcion: true }
          }
        }
      });

      return {
        auto: autoCompleto,
        usuario: usuarioActualizado,
      };
    });

  } catch (error) {
    console.error('🔥 Error en transacción:', error);
    throw error;
  }
};