import express from "express"
import cors from "cors"
import helmet from "helmet"
import session from "express-session"
import passport from "passport"
import "./config/passport"

import autoRoutes from "./routes/auto.routes"
import passwordRoutes from "./routes/password.routes"
import registroHostRoutes from "./routes/registroHost.routes"
import authRoutes from "./routes/auth.routes"

require('dotenv').config();

const app = express()
const PORT = process.env.PORT || 4000

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
)
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Configuración de sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET || "redibo_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    },
  }),
)

// Inicializar Passport
app.use(passport.initialize())
app.use(passport.session())

// Rutas
app.use("/api", autoRoutes)
app.use("/api", passwordRoutes)
app.use("/api", registroHostRoutes)
app.use("/api", authRoutes)

// Ruta de bienvenida
app.get("/", (req, res) => {
  res.send("Bienvenido al back de REDIBO")
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
