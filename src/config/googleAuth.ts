import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3001/api/auth/google/callback",
    },

    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) return done(new Error("No se pudo obtener el email"), false);

        // Buscar usuario sin crear
        const user = await prisma.usuario.findUnique({ where: { email } });

        // Devolver el usuario si existe, si no, devolver solo el email
        if (user) {
          return done(null, user);
        } else {
          const newUser = await prisma.usuario.create({
            data: {
              email,
              nombreCompleto: "",
              registradoCon: "google",
              verificado: false,
            },
          });
          return done(null, newUser);  // devuelve el email nomás
        }
      } catch (error: any) {
        if (error.name === "EmailAlreadyRegistered") {
          return done(null, false, { message: error.message });
        }

        return done(error, undefined);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.email); // 👈 guardamos solo el email
});

passport.deserializeUser(async (email: string, done) => {
  try {
    const user = await prisma.usuario.findUnique({ where: { email } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
