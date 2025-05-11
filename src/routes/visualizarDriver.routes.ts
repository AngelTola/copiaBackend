import { Router, Request, Response, NextFunction } from "express";
import { getDriverProfile } from "../controllers/authVisualizarDriver/VisualizarDriver.controller";

const router = Router();

// Agregamos tipo explícito para evitar conflictos con TypeScript
router.get(
  "/profile/:id_usuario",
  (req: Request, res: Response, next: NextFunction) => {
    void getDriverProfile(req, res, next);
  }
);

export default router;
