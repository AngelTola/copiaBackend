// src/controllers/auth/authVisualizarDriver/visualizarDriver.controller.ts
import { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../../../middlewares/auth/authDriverMiddleware";

const prisma = new PrismaClient();

export const getDriverProfile: RequestHandler = async (req, res, next) => {
  const authReq = req as AuthenticatedRequest;
  const idUsuario = authReq.user?.idUsuario;

  if (!idUsuario) {
    res.status(401).json({ message: "No autorizado: token inválido o ausente" });
    return;
  }

  try {
    const driver = await prisma.driver.findUnique({
      where: { idUsuario },
      include: { usuario: true },
    });

    if (!driver) {
      res.status(404).json({ message: "Driver no encontrado" });
      return;
    }

    res.json(driver);
  } catch (error) {
    console.error("Error al obtener perfil del driver:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};
//cambios
