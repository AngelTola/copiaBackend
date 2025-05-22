
import { Router } from "express";
import { register, login, getUserProfile } from "@/controllers/authController";
import { validateRegister } from "@/middlewares/validateRegister"; 
import { validateLogin } from "@/middlewares/validateLogin";
import passport from "passport";
import { updateGoogleProfile } from "../controllers/authController";
import { checkPhoneExists } from "@/controllers/authController";
import { me } from "@/controllers/authController";
import { isAuthenticated } from "@/middlewares/isAuthenticated";
import { Request, Response } from 'express';

import {deleteProfilePhoto,uploadProfilePhoto,upload,} from "@/controllers/authController";
import { authMiddleware } from "@/middlewares/authMiddleware";

import { updateUserField } from "@/controllers/authController"; 

const router = Router();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

router.post("/google/complete-profile", updateGoogleProfile);

router.put("/user/update", authMiddleware, updateUserField);

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${CLIENT_URL}?error=google`,
    session: true,
  }),
  (req: Request, res: Response) => {
    res.redirect(`${CLIENT_URL}/home?googleComplete=true`);
  }
);
router.get("/auth/success", (req, res) => {
  res.send("Inicio de sesión con Google exitoso!");
});

router.patch("/update-profile", updateGoogleProfile);

router.get("/auth/failure", (req, res) => {
  res.send("Fallo al iniciar sesión con Google.");
});

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/me", isAuthenticated, me);
router.get("/user-profile/:id_usuario", getUserProfile);

router.post(
  "/upload-profile-photo",
  authMiddleware,
  upload.single("foto_perfil"),
  uploadProfilePhoto
);
router.delete("/delete-profile-photo", authMiddleware, deleteProfilePhoto);

router.post("/check-phone", checkPhoneExists);

passport.authenticate("google", {
  failureRedirect: `${CLIENT_URL}/home?error=cuentaExistente`,
  session: true,
}),
  (req: Request, res: Response) => {
    res.redirect(`${CLIENT_URL}/home?googleComplete=true`);
  };
export default router;