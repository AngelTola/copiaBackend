import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getDriverProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id_usuario } = req.params;

  try {
    const driver = await prisma.driver.findUnique({
      where: { id_usuario: Number(id_usuario) },
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
