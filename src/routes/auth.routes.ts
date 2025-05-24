import { Router } from "express"
import {
  register,
  login,
  getUserProfile,
  updateGoogleProfile,
  checkPhoneExists,
  me,
  deleteProfilePhoto,
  uploadProfilePhoto,
  upload,
  updateUserField,
} from "@/controllers/authController"
import { validateRegister } from "@/middlewares/validateRegister"
import { validateLogin } from "@/middlewares/validateLogin"
import { isAuthenticated } from "@/middlewares/isAuthenticated"
import { authMiddleware } from "@/middlewares/authMiddleware"
import passport from "passport"
import type { Request, Response } from "express"

const router = Router()

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000"

// Rutas de autenticación con Google
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }))

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${CLIENT_URL}/home?error=google`,
    session: true,
  }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as any

      if (!user) {
        console.error("No se encontró usuario después de autenticación")
        res.redirect(`${CLIENT_URL}/home?error=google`)
        return
      }

      console.log("Usuario autenticado:", user.email)

      // Verificar si el usuario necesita completar su perfil
      const needsProfile =
        !user.fechaNacimiento ||
        user.fechaNacimiento.toString() === "2000-01-01T00:00:00.000Z" ||
        !user.nombre ||
        !user.apellido

      if (needsProfile) {
        console.log("Usuario necesita completar perfil:", user.email)
        res.redirect(`${CLIENT_URL}/home?googleComplete=true&email=${encodeURIComponent(user.email)}`)
      } else {
        console.log("Usuario con perfil completo:", user.email)
        res.redirect(`${CLIENT_URL}/home/homePage`)
      }
    } catch (error) {
      console.error("Error en callback de Google:", error)
      res.redirect(`${CLIENT_URL}/home?error=google`)
    }
  },
)

router.get("/auth/success", (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.json({
      success: true,
      message: "Inicio de sesión con Google exitoso!",
      user: req.user,
    })
  } else {
    res.status(401).json({ success: false, message: "No autenticado" })
  }
})

router.get("/auth/failure", (req: Request, res: Response) => {
  res.status(401).json({ success: false, message: "Fallo al iniciar sesión con Google." })
})

// Ruta para completar perfil de Google
router.post("/google/complete-profile", updateGoogleProfile)

// Rutas de registro y login tradicionales
router.post("/register", validateRegister, register)
router.post("/login", validateLogin, login)

// Rutas de usuario autenticado
router.get("/me", isAuthenticated, me)
router.get("/user-profile/:id_usuario", getUserProfile)

// Ruta para verificar teléfono
router.post("/check-phone", checkPhoneExists)

// Rutas de perfil con autenticación
router.post("/upload-profile-photo", authMiddleware, upload.single("foto_perfil"), uploadProfilePhoto)
router.delete("/delete-profile-photo", authMiddleware, deleteProfilePhoto)
router.put("/user/update", authMiddleware, updateUserField)

// Ruta para cerrar sesión
router.post("/logout", (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      console.error("Error al cerrar sesión:", err)
      res.status(500).json({ message: "Error al cerrar sesión" })
      return
    }
    req.session.destroy((err) => {
      if (err) {
        console.error("Error al destruir sesión:", err)
        res.status(500).json({ message: "Error al cerrar sesión" })
        return
      }
      res.clearCookie("connect.sid")
      res.json({ message: "Sesión cerrada exitosamente" })
    })
  })
})

export default router
