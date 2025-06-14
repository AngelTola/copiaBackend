import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();
import passwordRoutes from '../src/routes/auth/password.routes';
import authRoutes from '../src/routes/auth/auth.routes';
import session from "express-session";
import passport from "passport";
import authRegistroHostRoutes from '../src/routes/auth/registroHost.routes';
import authRegistroDriverRoutes from '../src/routes/auth/registroDriver.routes'; // Import the driver routes
import "../src/config/googleAuth"; // <--- importante
import usuarioRoutes from '../src/routes/auth/usuario.routes';
import visualizarDriverRoutes from "../src/routes/auth/visualizarDriver.routes";
import autoRoutes from "../src/routes/qantastic/auto.routes";

import path from 'path';
// Cargar variables de entorno

const app = express();
const PORT = process.env.PORT || 3001;
const FRONT_URL =  process.env.CLIENT_URL

// Middlewares
app.use(cors({
  origin: FRONT_URL, // tu frontend
  credentials: true,               // para enviar cookies/sesiones
}));
/*app.use(helmet());*/
app.use(helmet({
  crossOriginResourcePolicy: false, // Añade esto para permitir imágenes externas
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//foto de perfil
/*app.use('/uploads', express.static('uploads'));*/
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
app.use(passport.initialize());
app.use(passport.session());
app.use('/uploads', express.static('uploads')); // Servir imágenes desde el servidor

app.use('/api', authRoutes);
app.use('/api', passwordRoutes);
app.use('/api', authRegistroHostRoutes);
app.use('/api', authRegistroDriverRoutes); // Añadir la ruta de registro de driver aquí
app.use('/api', usuarioRoutes); // Añadir la ruta de usuario aquí
app.use('/api', visualizarDriverRoutes);// Añadir la ruta de visualizar driver aquí
app.use('/api', autoRoutes);

app.get('/', (req, res) => {
  res.send('Bienvenido al back de REDIBO');
});
// End point para verificar la salud de la conexión de la API
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;