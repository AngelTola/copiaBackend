import passport from "passport"
import { PrismaClient } from "@prisma/client"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { findOrCreateGoogleUser } from "../services/auth.service"

const prisma = new PrismaClient()

// Verifica si las variables de entorno están definidas
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:4000/api/auth/google/callback"

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn("⚠️ Advertencia: GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET no están definidos")
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID || "",
      clientSecret: GOOGLE_CLIENT_SECRET || "",
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value
        const name = profile.name?.givenName ?? ""
        const apellido = profile.name?.familyName ?? ""

        if (!email) {
          return done(new Error("No se pudo obtener el email de Google"), false)
        }

        console.log(`👤 Autenticando usuario de Google: ${email}`)

        const user = await findOrCreateGoogleUser(email, name, apellido)

        console.log(`✅ Usuario autenticado: ${user.email}`)
        return done(null, user)
      } catch (error: any) {
        console.error("❌ Error en autenticación Google:", error)
        if (error.name === "EmailAlreadyRegistered") {
          return done(null, false, { message: error.message })
        }
        return done(error, undefined)
      }
    },
  ),
)

passport.serializeUser((user: any, done) => {
  console.log(`🔑 Serializando usuario: ${user.email}`)
  done(null, user.idUsuario) // Guardar el ID en la sesión
})

passport.deserializeUser(async (id: number, done) => {
  try {
    console.log(`🔍 Deserializando usuario ID: ${id}`)
    const user = await prisma.usuario.findUnique({
      where: { idUsuario: id },
      select: {
        idUsuario: true,
        email: true,
        nombre: true,
        apellido: true,
        registradoCon: true,
      },
    })
    done(null, user)
  } catch (error) {
    console.error("❌ Error al deserializar usuario:", error)
    done(error, null)
  }
})

export default passport
