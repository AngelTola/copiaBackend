import passport from "passport";
import { PrismaClient } from "@prisma/client";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL ||  "http://localhost:4000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;

        if(!email){
          return done(new Error("No se pudo obtener email google"), false);
        }

        let user = await prisma.usuario.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.usuario.create({
            data: {
              email,
              nombre: profile.name?.givenName ?? "",
              apellido: profile.name?.familyName ?? "",
              contraseña: "",
              registradoCon: "google"
            },
          });
        }

        done(null, user);
      } catch (error) {
        done(error, false);
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
    done(null, user || null);
  } catch (err) {
    done(err, null);
  }
});
