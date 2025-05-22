import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const findUserByEmail = async (email: string) => {
  return prisma.usuario.findUnique({ where: { email } });
};

export const createUser = async (data: {
  nombre: string;
  apellido: string;
  email: string;
  contraseña: string;
  fechaNacimiento: string;
  telefono?: string | null;
}) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(data.contraseña, salt);

  return prisma.usuario.create({
    data: {
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      contraseña: hashedPassword,
      fechaNacimiento: new Date(data.fechaNacimiento),
      telefono: data.telefono ?? null,
      registradoCon: "email",
      verificado: false,
      host: false
    },
  });
};

export const updateGoogleProfile = async (
  email: string,
  nombre: string,
  apellido: string,
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
      nombre,
      apellido,
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
    select: {
      idUsuario: true,
      nombre: true,
      apellido: true,
      email: true,
      telefono: true,
      fechaNacimiento: true,
    },
  });
};
export const createUserWithGoogle = async (email: string, name: string, apellido: string) => {
  return prisma.usuario.create({
    data: {
      email,
      nombre: name,
      apellido: apellido,
      registradoCon: "google",
      verificado: true
    },
  });
};

export const findOrCreateGoogleUser = async (email: string, name: string, apellido: string) => {
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
      nombre: name,
      apellido: apellido,
      registradoCon: "google",
      verificado: true
    },
  });
};

export const findUserByPhone = async (telefono: string) => {
  return prisma.usuario.findFirst({ where: { telefono } });
};
