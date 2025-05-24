import express from "express"
import cors from "cors"
import helmet from "helmet"
import session from "express-session"
import passport from "passport"
import "./config/passport"
import authRegistroHostRoutes from './routes/registroHost.routes';
import authRegistroDriverRoutes from './routes/registroDriver.routes';
import "./config/googleAuth"; // <--- importante
import visualizarDriverRoutes from "./routes/visualizarDriver.routes";
import path from 'path';
import autoRoutes from "./routes/auto.routes"
import passwordRoutes from "./routes/password.routes"
import registroHostRoutes from "./routes/registroHost.routes"
import authRoutes from "./routes/auth.routes"
import usuarioRoutes from "./routes/usuario.routes"

require('dotenv').config();

const app = express()
const PORT = process.env.PORT || 4000

app.use(helmet({
  crossOriginResourcePolicy: false, // Añade esto para permitir imágenes externas
}));

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

app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); //permite desde cualquier origen
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
}, express.static(path.join(__dirname, '..', 'uploads')));
app.use(
  session({
    secret: "mi_clave_secreta_segura", // cámbiala por algo más seguro
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // ⚠️ en producción debe ser true con HTTPS
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Inicializar Passport
app.use(passport.initialize())
app.use(passport.session())
app.use('/uploads', express.static('uploads')); // Servir imágenes desde el servidor

// Rutas
app.use("/api", autoRoutes)
app.use("/api", passwordRoutes)
app.use("/api", registroHostRoutes)
app.use("/api", authRoutes)
app.use('/api', authRoutes);
app.use('/api', authRegistroHostRoutes);
app.use('/api', authRegistroDriverRoutes); // Añadir la ruta de registro de driver aquí
app.use('/api', usuarioRoutes); // Añadir la ruta de usuario aquí
app.use('/api', visualizarDriverRoutes);// Añadir la ruta de visualizar driver aquí

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Ruta de bienvenida
app.get("/", (req, res) => {
  res.send("Bienvenido al back de REDIBO")
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
