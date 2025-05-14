import { Router } from "express";
import { getDriverProfile } from "../controllers/authVisualizarDriver/VisualizarDriver.controller";
import { authDriverMiddleware } from "../middlewares/authDriverMiddleware"; // importa el nuevo middleware

const router = Router();

router.get(
  "/profile",
  authDriverMiddleware, // protege la ruta con el token
  getDriverProfile
);

export default router;
