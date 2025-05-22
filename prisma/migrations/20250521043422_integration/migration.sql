-- CreateEnum
CREATE TYPE "TipoCalificacionUsuario" AS ENUM ('ARRENDADOR', 'ARRENDATARIO');

-- CreateEnum
CREATE TYPE "EstadoReserva" AS ENUM ('SOLICITADA', 'APROBADA', 'RECHAZADA', 'CONFIRMADA', 'CANCELADA', 'EN_CURSO', 'FINALIZADA');

-- CreateEnum
CREATE TYPE "EstadoGarantia" AS ENUM ('DEPOSITADA', 'LIBERADA', 'RETENIDA');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('QR', 'TARJETA_DEBITO', 'EFECTIVO');

-- CreateEnum
CREATE TYPE "Transmision" AS ENUM ('AUTOMATICO', 'MANUAL');

-- CreateEnum
CREATE TYPE "Combustible" AS ENUM ('GASOLINA', 'DIESEL', 'ELECTRICO', 'HIBRIDO');

-- CreateEnum
CREATE TYPE "TipoMantenimiento" AS ENUM ('PREVENTIVO', 'CORRECTIVO', 'REVISION');

-- CreateEnum
CREATE TYPE "EstadoAuto" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "MotivoNoDisponibilidad" AS ENUM ('MANTENIMIENTO', 'REPARACION', 'USO_PERSONAL', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoPago" AS ENUM ('RENTA', 'GARANTIA');

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ARRENDADOR', 'RENTADOR', 'DRIVER');

-- CreateEnum
CREATE TYPE "PrioridadNotificacion" AS ENUM ('BAJA', 'MEDIA', 'ALTA');

-- CreateEnum
CREATE TYPE "RegistradoCon" AS ENUM ('email', 'google');

-- CreateEnum
CREATE TYPE "TipoVerificacion" AS ENUM ('recuperacion', 'verificacion');

-- CreateEnum
CREATE TYPE "TipoDeNotificacion" AS ENUM ('RESERVA_SOLICITADA', 'RESERVA_APROBADA', 'RESERVA_RECHAZADA', 'DEPOSITO_CONFIRMADO', 'DEPOSITO_RECIBIDO', 'RESERVA_CANCELADA', 'ALQUILER_FINALIZADO', 'RESERVA_MODIFICADA', 'VEHICULO_CALIFICADO');

-- CreateTable
CREATE TABLE "usuarios" (
    "idUsuario" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contraseña" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "telefono" TEXT,
    "registradoCon" "RegistradoCon" NOT NULL,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "host" BOOLEAN NOT NULL DEFAULT false,
    "fotoPerfil" TEXT,
    "codigoVerificacion" TEXT,
    "bloqueado" BOOLEAN NOT NULL DEFAULT false,
    "fechaBloqueado" TIMESTAMP(3),
    "intentosFallidos" INTEGER NOT NULL DEFAULT 0,
    "direccion" TEXT,
    "esAdmin" BOOLEAN NOT NULL DEFAULT false,
    "metodoPago" "MetodoPago",
    "numeroTarjeta" TEXT,
    "fechaExpiracion" TEXT,
    "titular" TEXT,
    "imagenQr" TEXT,
    "detallesMetodoPago" TEXT,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("idUsuario")
);

-- CreateTable
CREATE TABLE "Verificaciones" (
    "idCodigo" SERIAL NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" "TipoVerificacion" NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiracion" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Verificaciones_pkey" PRIMARY KEY ("idCodigo")
);

-- CreateTable
CREATE TABLE "TerminosCondiciones" (
    "idAceptacion" SERIAL NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "versionTerminos" VARCHAR(10) NOT NULL,
    "fechaAceptacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TerminosCondiciones_pkey" PRIMARY KEY ("idAceptacion")
);

-- CreateTable
CREATE TABLE "drivers" (
    "idDriver" SERIAL NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "licencia" TEXT NOT NULL,
    "fechaExpiracion" TIMESTAMP(3) NOT NULL,
    "tipoLicencia" TEXT,
    "añosExperiencia" INTEGER,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("idDriver")
);

-- CreateTable
CREATE TABLE "usuario_drivers" (
    "id" SERIAL NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "idDriver" INTEGER NOT NULL,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacion" (
    "idNotificacion" SERIAL NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "titulo" VARCHAR(100) NOT NULL,
    "mensaje" TEXT NOT NULL,
    "idEntidad" TEXT,
    "tipoEntidad" VARCHAR(50),
    "leido" BOOLEAN NOT NULL DEFAULT false,
    "leidoEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "haSidoBorrada" BOOLEAN NOT NULL DEFAULT false,
    "tipo" "TipoDeNotificacion" NOT NULL,
    "prioridad" "PrioridadNotificacion" NOT NULL DEFAULT 'MEDIA',

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("idNotificacion")
);

-- CreateTable
CREATE TABLE "ubicaciones" (
    "idUbicacion" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "esActiva" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ubicaciones_pkey" PRIMARY KEY ("idUbicacion")
);

-- CreateTable
CREATE TABLE "autos" (
    "idAuto" SERIAL NOT NULL,
    "idPropietario" INTEGER NOT NULL,
    "idUbicacion" INTEGER NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "descripcion" TEXT,
    "precioRentaDiario" DECIMAL(10,2) NOT NULL,
    "montoGarantia" DECIMAL(10,2) NOT NULL,
    "kilometraje" INTEGER NOT NULL DEFAULT 0,
    "calificacionPromedio" DOUBLE PRECISION,
    "totalComentarios" INTEGER NOT NULL DEFAULT 0,
    "tipo" TEXT NOT NULL,
    "año" INTEGER NOT NULL,
    "placa" TEXT NOT NULL,
    "soat" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "estado" "EstadoAuto" NOT NULL DEFAULT 'ACTIVO',
    "fechaAdquisicion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "asientos" INTEGER NOT NULL DEFAULT 5,
    "capacidadMaletero" INTEGER NOT NULL,
    "transmision" "Transmision" NOT NULL,
    "combustible" "Combustible" NOT NULL,
    "diasTotalRenta" INTEGER,
    "vecesAlquilado" INTEGER,

    CONSTRAINT "autos_pkey" PRIMARY KEY ("idAuto")
);

-- CreateTable
CREATE TABLE "imagenes" (
    "idImagen" SERIAL NOT NULL,
    "idAuto" INTEGER NOT NULL,
    "direccionImagen" TEXT NOT NULL,

    CONSTRAINT "imagenes_pkey" PRIMARY KEY ("idImagen")
);

-- CreateTable
CREATE TABLE "disponibilidad" (
    "idDisponibilidad" SERIAL NOT NULL,
    "idAuto" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "motivo" "MotivoNoDisponibilidad" NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "disponibilidad_pkey" PRIMARY KEY ("idDisponibilidad")
);

-- CreateTable
CREATE TABLE "reservas" (
    "idReserva" SERIAL NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "idAuto" INTEGER NOT NULL,
    "idCliente" INTEGER NOT NULL,
    "estado" "EstadoReserva" NOT NULL DEFAULT 'SOLICITADA',
    "fechaSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaAprobacion" TIMESTAMP(3),
    "fechaLimitePago" TIMESTAMP(3) NOT NULL,
    "montoTotal" DECIMAL(10,2) NOT NULL,
    "kilometrajeInicial" INTEGER,
    "kilometrajeFinal" INTEGER,
    "estaPagada" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("idReserva")
);

-- CreateTable
CREATE TABLE "pagos" (
    "idPago" SERIAL NOT NULL,
    "idReserva" INTEGER NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "fechaPago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metodoPago" "MetodoPago" NOT NULL,
    "referencia" TEXT,
    "comprobante" TEXT,
    "tipo" "TipoPago" NOT NULL DEFAULT 'RENTA',

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("idPago")
);

-- CreateTable
CREATE TABLE "garantias" (
    "idGarantia" SERIAL NOT NULL,
    "idReserva" INTEGER NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "fechaDeposito" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaLiberacion" TIMESTAMP(3),
    "estado" "EstadoGarantia" NOT NULL DEFAULT 'DEPOSITADA',
    "comprobante" TEXT,

    CONSTRAINT "garantias_pkey" PRIMARY KEY ("idGarantia")
);

-- CreateTable
CREATE TABLE "historial_mantenimiento" (
    "idHistorial" SERIAL NOT NULL,
    "idAuto" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFin" TIMESTAMP(3),
    "descripcion" TEXT NOT NULL,
    "costo" DECIMAL(10,2),
    "tipoMantenimiento" "TipoMantenimiento" NOT NULL,
    "kilometraje" INTEGER NOT NULL,

    CONSTRAINT "historial_mantenimiento_pkey" PRIMARY KEY ("idHistorial")
);

-- CreateTable
CREATE TABLE "comentarios" (
    "idComentario" SERIAL NOT NULL,
    "idAuto" INTEGER NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "contenido" TEXT,
    "calificacion" SMALLINT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idReserva" INTEGER,

    CONSTRAINT "comentarios_pkey" PRIMARY KEY ("idComentario")
);

-- CreateTable
CREATE TABLE "calificaciones_usuarios" (
    "idCalificacion" SERIAL NOT NULL,
    "idCalificador" INTEGER NOT NULL,
    "idCalificado" INTEGER NOT NULL,
    "puntuacion" SMALLINT NOT NULL,
    "comentario" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idReserva" INTEGER NOT NULL,
    "tipoCalificacion" "TipoCalificacionUsuario" NOT NULL,

    CONSTRAINT "calificaciones_usuarios_pkey" PRIMARY KEY ("idCalificacion")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_idUsuario_key" ON "drivers"("idUsuario");

-- CreateIndex
CREATE INDEX "usuario_drivers_idUsuario_idx" ON "usuario_drivers"("idUsuario");

-- CreateIndex
CREATE INDEX "usuario_drivers_idDriver_idx" ON "usuario_drivers"("idDriver");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_drivers_idUsuario_idDriver_key" ON "usuario_drivers"("idUsuario", "idDriver");

-- CreateIndex
CREATE INDEX "Notificacion_idUsuario_idx" ON "Notificacion"("idUsuario");

-- CreateIndex
CREATE INDEX "Notificacion_creadoEn_idx" ON "Notificacion"("creadoEn");

-- CreateIndex
CREATE INDEX "Notificacion_leido_idUsuario_idx" ON "Notificacion"("leido", "idUsuario");

-- CreateIndex
CREATE INDEX "Notificacion_idUsuario_haSidoBorrada_idx" ON "Notificacion"("idUsuario", "haSidoBorrada");

-- CreateIndex
CREATE UNIQUE INDEX "Notificacion_idUsuario_idEntidad_tipo_key" ON "Notificacion"("idUsuario", "idEntidad", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "ubicaciones_nombre_key" ON "ubicaciones"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "autos_placa_key" ON "autos"("placa");

-- CreateIndex
CREATE INDEX "autos_idUbicacion_idx" ON "autos"("idUbicacion");

-- CreateIndex
CREATE UNIQUE INDEX "garantias_idReserva_key" ON "garantias"("idReserva");

-- CreateIndex
CREATE UNIQUE INDEX "comentarios_idReserva_key" ON "comentarios"("idReserva");

-- CreateIndex
CREATE UNIQUE INDEX "calificaciones_usuarios_idReserva_key" ON "calificaciones_usuarios"("idReserva");

-- CreateIndex
CREATE INDEX "calificaciones_usuarios_idCalificado_idx" ON "calificaciones_usuarios"("idCalificado");

-- CreateIndex
CREATE INDEX "calificaciones_usuarios_idCalificador_idx" ON "calificaciones_usuarios"("idCalificador");

-- AddForeignKey
ALTER TABLE "Verificaciones" ADD CONSTRAINT "Verificaciones_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "usuarios"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerminosCondiciones" ADD CONSTRAINT "TerminosCondiciones_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "usuarios"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "usuarios"("idUsuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_drivers" ADD CONSTRAINT "usuario_drivers_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "usuarios"("idUsuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_drivers" ADD CONSTRAINT "usuario_drivers_idDriver_fkey" FOREIGN KEY ("idDriver") REFERENCES "drivers"("idDriver") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "usuarios"("idUsuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autos" ADD CONSTRAINT "autos_idUbicacion_fkey" FOREIGN KEY ("idUbicacion") REFERENCES "ubicaciones"("idUbicacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autos" ADD CONSTRAINT "autos_idPropietario_fkey" FOREIGN KEY ("idPropietario") REFERENCES "usuarios"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagenes" ADD CONSTRAINT "imagenes_idAuto_fkey" FOREIGN KEY ("idAuto") REFERENCES "autos"("idAuto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilidad" ADD CONSTRAINT "disponibilidad_idAuto_fkey" FOREIGN KEY ("idAuto") REFERENCES "autos"("idAuto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_idAuto_fkey" FOREIGN KEY ("idAuto") REFERENCES "autos"("idAuto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_idCliente_fkey" FOREIGN KEY ("idCliente") REFERENCES "usuarios"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_idReserva_fkey" FOREIGN KEY ("idReserva") REFERENCES "reservas"("idReserva") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "garantias" ADD CONSTRAINT "garantias_idReserva_fkey" FOREIGN KEY ("idReserva") REFERENCES "reservas"("idReserva") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_mantenimiento" ADD CONSTRAINT "historial_mantenimiento_idAuto_fkey" FOREIGN KEY ("idAuto") REFERENCES "autos"("idAuto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_idAuto_fkey" FOREIGN KEY ("idAuto") REFERENCES "autos"("idAuto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "usuarios"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_idReserva_fkey" FOREIGN KEY ("idReserva") REFERENCES "reservas"("idReserva") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificaciones_usuarios" ADD CONSTRAINT "calificaciones_usuarios_idCalificador_fkey" FOREIGN KEY ("idCalificador") REFERENCES "usuarios"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificaciones_usuarios" ADD CONSTRAINT "calificaciones_usuarios_idCalificado_fkey" FOREIGN KEY ("idCalificado") REFERENCES "usuarios"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificaciones_usuarios" ADD CONSTRAINT "calificaciones_usuarios_idReserva_fkey" FOREIGN KEY ("idReserva") REFERENCES "reservas"("idReserva") ON DELETE RESTRICT ON UPDATE CASCADE;
