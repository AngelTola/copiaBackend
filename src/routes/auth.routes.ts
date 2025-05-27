// src/routes/auth.routes.ts
import { Router } from "express";
import { register, login, getUserProfile } from "../../src/controllers/auth.controller";
import { validateRegister } from "../../src/middlewares/validateRegister";
import { validateLogin } from "../../src/middlewares/validateLogin";
import passport from "passport";
import { updateGoogleProfile } from "../controllers/auth.controller";
import { checkPhoneExists } from "../../src/controllers/auth.controller";
import { me } from "../../src/controllers/auth.controller";
import { isAuthenticated } from "../../src/middlewares/isAuthenticated";
import {deleteProfilePhoto,uploadProfilePhoto,upload,} from "../../src/controllers/authPerfilUsuarioRenter/fotoPerfil.controller";
import { authMiddleware } from "../../src/middlewares/authMiddleware";
import { updateUserField } from "../../src/controllers/auth.controller";
import { deleteIncompleteUser } from "../../src/controllers/auth.controller"; 
import { registroDriver, obtenerDriver } from "../../src/controllers/auth.controller";
import jwt from "jsonwebtoken";
import { generateToken } from "../../src/utils/generateToken";

const router = Router();
const FRONT_URL = process.env.CLIENT_URL;

router.post("/google/complete-profile", updateGoogleProfile);
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post(
  "/upload-profile-photo",
  authMiddleware,
  upload.single("fotoPerfil"),
  uploadProfilePhoto
);
router.post("/check-phone", checkPhoneExists);
router.post("/registro-driver", authMiddleware, registroDriver);

router.put("/user/update", authMiddleware, updateUserField);

router.patch("/update-profile", updateGoogleProfile);

router.delete("/delete-profile-photo", authMiddleware, deleteProfilePhoto);
router.delete("/delete-incomplete-user", deleteIncompleteUser);

router.get("/me", isAuthenticated, me);
router.get("/user-profile/:idUsuario", getUserProfile);
router.get("/driver-info", authMiddleware, obtenerDriver);
router.get("/auth/success", (req, res) => {
  res.send("Inicio de sesión con Google exitoso!");
});
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get("/auth/failure", (req, res) => {
  res.send("Fallo al iniciar sesión con Google.");
});
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${FRONT_URL}?error=google`,
    session: true,
  }),
  (req, res) => {
    const user = req.user as any;

    if (!user) {
      return res.redirect(`${FRONT_URL}?error=sinusuario`);
    }

    if (user.nombreCompleto && user.fechaNacimiento) {
      const token = generateToken({
        idUsuario: user.idUsuario,
        email: user.email,
        nombreCompleto: user.nombreCompleto,
      });
      return res.redirect(`${FRONT_URL}/home?token=${token}`);
    } else {
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET no definido");
      }

      const tempToken = jwt.sign({ email: user.email, idUsuario: -1 }, process.env.JWT_SECRET, {
        expiresIn: "15m",
      });

      return res.redirect(`${FRONT_URL}/home?googleComplete=true&token=${tempToken}`);
    }
  }
);

export default router;