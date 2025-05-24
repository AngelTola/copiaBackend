import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const findUserByEmail = async (email: string) => {
  return prisma.usuario.findUnique({ where: { email } });
};

export const createUser = async (data: {
  nombreCompleto: string;
  email: string;
  contraseña: string;
  fechaNacimiento: string;
  telefono?: string;
}) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(data.contraseña, salt);

  return prisma.usuario.create({
    data: {
      nombreCompleto: data.nombreCompleto,
      email: data.email,
      contraseña: hashedPassword,
      fechaNacimiento: new Date(data.fechaNacimiento),
      telefono: data.telefono ?? null,
      registradoCon: "email",
      verificado: false,
      host: false,
      //driver: false,
    },
  });
};

export const updateGoogleProfile = async (
  email: string,
  nombreCompleto: string,
  fechaNacimiento: string
) => {

  const existingUser = await prisma.usuario.findUnique({
    where: { email },
  });

  if (existingUser && existingUser.registradoCon === "email") {
    throw new Error("Este correo ya está registrado con email");
  }

  const updatedUser = await prisma.usuario.update({
    where: { email },
    data: {
      nombreCompleto,
      fechaNacimiento: new Date(fechaNacimiento),
    },
  });

  return updatedUser;
};

export const validatePassword = async (
  inputPassword: string,
  hashedPassword: string
) => {
  return bcrypt.compare(inputPassword, hashedPassword);
};

export const getUserById = async (idUsuario: number) => {
  return await prisma.usuario.findUnique({
    where: { idUsuario },
    select: { // Evita traer la contraseña u otros campos sensibles
      idUsuario: true,
      nombreCompleto: true,
      email: true,
      telefono: true,
      fechaNacimiento: true,
    },
  });
};
export const createUserWithGoogle = async (email: string, name: string) => {
  return prisma.usuario.create({
    data: {
      email,
      nombreCompleto: name,
      registradoCon: "google",
      verificado: true,
    },
  });
};

export const findOrCreateGoogleUser = async (email: string, name: string) => {
  const existingUser = await prisma.usuario.findUnique({ where: { email } });

  if (existingUser) {
    
    if (existingUser && existingUser.registradoCon === "email") {
      const error: any = new Error("Este correo ya está registrado con email.");
      error.name = "EmailAlreadyRegistered";
      throw error;
    }

    if (existingUser) return existingUser;

  }

  return prisma.usuario.create({
    data: {
      email,
      nombreCompleto: name,
      registradoCon: "google",
      verificado: true,
    },
  });
};

export const findUserByPhone = async (telefono: string) => {
  return prisma.usuario.findFirst({ where: { telefono } });
};
