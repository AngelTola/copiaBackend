import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { PrismaClient } from "@prisma/client";
import { findOrCreateGoogleUser } from "../services/auth.service";

const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:4000/api/auth/google/callback",
    },

    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        const name = profile.name?.givenName ?? "";
        const apellido = profile.name?.familyName ?? "";

        if (!email)
          return done(new Error("No se pudo obtener el email de Google"), false);

        const user = await findOrCreateGoogleUser(email, name, apellido);

        if (!user.idUsuario) {
          return done(null, false, {
            message: "No se pudo obtener el ID del usuario",
          });
        }

        return done(null, user);
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
  done(null, user.email);
});

passport.deserializeUser(async (email: string, done) => {
  try {
    const user = await prisma.usuario.findUnique({ where: { email } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
