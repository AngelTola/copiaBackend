-- CreateEnum
CREATE TYPE "RegistradoCon" AS ENUM ('email', 'google');

-- CreateEnum
CREATE TYPE "TipoVerificacion" AS ENUM ('recuperacion', 'verificacion');

-- CreateEnum
CREATE TYPE "TipoMetodoPago" AS ENUM ('tarjeta', 'efectivo', 'qr');

-- CreateTable
CREATE TABLE "Usuario" (
    "id_usuario" SERIAL NOT NULL,
    "nombre_completo" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "contraseña" VARCHAR(255) DEFAULT '',
    "fecha_nacimiento" TIMESTAMP(3),
    "telefono" INTEGER,
    "registrado_con" "RegistradoCon" NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "host" BOOLEAN NOT NULL DEFAULT false,
    "driverBool" BOOLEAN NOT NULL DEFAULT false,
    "assignedToDriver" INTEGER,
    "codigoVerificacion" TEXT,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "blockuntil" TIMESTAMP(3),
    "failedCodeAttempts" INTEGER NOT NULL DEFAULT 0,
    "foto_perfil" VARCHAR(255),
    "ediciones_nombre" INTEGER NOT NULL DEFAULT 0,
    "ediciones_fecha" INTEGER NOT NULL DEFAULT 0,
    "ediciones_telefono" INTEGER NOT NULL DEFAULT 0,
    "metodo_pago_tipo" "TipoMetodoPago",
    "numero_tarjeta" VARCHAR(16),
    "fecha_expiracion" VARCHAR(5),
    "titular" VARCHAR(100),
    "imagen_qr" VARCHAR(255),
    "detalles_metodo_pago" TEXT,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "Vehiculo" (
    "id_vehiculo" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "placa" VARCHAR(10) NOT NULL,
    "soat" VARCHAR(50) NOT NULL,
    "imagenes" TEXT[],

    CONSTRAINT "Vehiculo_pkey" PRIMARY KEY ("id_vehiculo")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id_usuario" INTEGER NOT NULL,
    "sexo" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "nro_licencia" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "fecha_emision" TIMESTAMP(3) NOT NULL,
    "fecha_vencimiento" TIMESTAMP(3) NOT NULL,
    "anversoUrl" TEXT NOT NULL,
    "reversoUrl" TEXT NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "Verificaciones" (
    "id_codigo" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "codigo" VARCHAR(6) NOT NULL,
    "tipo" "TipoVerificacion" NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiracion" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Verificaciones_pkey" PRIMARY KEY ("id_codigo")
);

-- CreateTable
CREATE TABLE "Terminos_condiciones" (
    "id_aceptacion" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "version_terminos" VARCHAR(10) NOT NULL,
    "fecha_aceptacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Terminos_condiciones_pkey" PRIMARY KEY ("id_aceptacion")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_assignedToDriver_fkey" FOREIGN KEY ("assignedToDriver") REFERENCES "Driver"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehiculo" ADD CONSTRAINT "Vehiculo_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verificaciones" ADD CONSTRAINT "Verificaciones_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Terminos_condiciones" ADD CONSTRAINT "Terminos_condiciones_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
