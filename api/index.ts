//src/index.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

// Configuración de Google Auth
import "../src/config/googleAuth";

// Rutas de autenticación
import passwordRoutes from "../src/routes/auth/password.routes";
import authRoutes from "../src/routes/auth/auth.routes";
import authRegistroHostRoutes from "../src/routes/auth/registroHost.routes";
import authRegistroDriverRoutes from "../src/routes/auth/registroDriver.routes";
import usuarioRoutes from "../src/routes/auth/usuario.routes";
import visualizarDriverRoutes from "../src/routes/auth/visualizarDriver.routes";
import listaDriversRoutes from "../src/routes/auth/listaDrivers.routes";
import visualizarRentersRoutes from "../src/routes/auth/visualizarRenters.routes";
import editarDriverRoutes from "../src/routes/auth/editarDriver.routes";
// Verificación en 2 pasos
import twofaRoutes from "../src/routes/auth/twofa.routes";

// Servicios y controladores de notificaciones
import { SSEService } from "../src/services/notificaciones/sse.service";
import { NotificacionService } from "../src/services/notificaciones/notificacion.service";
import { NotificacionController } from "../src/controllers/notificaciones/notificacion.controller";
import { SSEController } from "../src/controllers/notificaciones/sse.controller";
import { createNotificacionRoutes } from "../src/routes/notificaciones/notificacion.routes";
// Servicios y controladores - SpeedCode
//import mapaRoutes from "../src/routes/speedcode/filtroMapaPrecioRoutes";
import mapaRoutes from "../src/routes/speedcode/filtroMapaPrecioRoutes";

//Servicios y controladores - QA-nTastic
import autoRoutes from "../src/routes/qantastic/auto.routes"

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const prisma = new PrismaClient();
const FRONT_URL = process.env.CLIENT_URL; // Variable agregada del segundo index

// ✅ Crear ubicación por defecto al iniciar el servidor
async function ensureDefaultUbicacion() {
  try {
    const existing = await prisma.ubicacion.findUnique({ where: { idUbicacion: 1 } });

    if (!existing) {
      await prisma.ubicacion.create({
        data: {
          idUbicacion: 1,
          nombre: "Ubicación por defecto",
          descripcion: "Generada automáticamente",
          latitud: -17.3935,
          longitud: -66.1570,
          esActiva: true,
        },
      });
      console.log("✅ Ubicación por defecto creada");
    } else {
      console.log("ℹ️ Ubicación por defecto ya existe");
    }
  } catch (error) {
    console.error("❌ Error al verificar/crear ubicación por defecto:", error);
    throw error;
  }
}

// ✅ CORS con configuración mejorada (combinando ambos enfoques)
app.use(cors({
  origin: FRONT_URL || "https://copia-front.vercel.app", // Usar FRONT_URL del .env o fallback
  credentials: true,
}));

// Middleware adicional para CORS headers (del primer index)
app.use((req: Request, res: Response, next: NextFunction): void => {
  res.header("Access-Control-Allow-Origin", FRONT_URL || "https://copia-front.vercel.app");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }

  next();
});

// Middlewares básicos
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para keep-alive (para notificaciones SSE)
app.use((req, res, next) => {
  req.socket.setKeepAlive(true);
  req.socket.setTimeout(0);
  next();
});

// Middleware para SSE (evitar compresión)
app.use((req, res, next) => {
  if (req.path.includes("/api/notificaciones/sse")) {
    res.set("Content-Encoding", "identity");
  }
  next();
});

// Configuración de archivos estáticos
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    next();
  },
  express.static(path.join(__dirname, "..", "uploads"))
);

// Configuración de sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mi_clave_secreta_segura",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    },
  })
);

// Configuración de Passport
app.use(passport.initialize());
app.use(passport.session());

// Configuración de servicios y controladores para notificaciones
const sseService = SSEService.getInstance();
const notificacionService = new NotificacionService();
const notificacionController = new NotificacionController(notificacionService);
const sseController = new SSEController(sseService);

// Configurar ping periódico para el SSE
setInterval(() => {
  sseService.enviarPing();
}, 30000); // 30 segundos

// Rutas de la aplicación
app.use("/api", authRoutes);
app.use("/api", passwordRoutes);
app.use("/api", authRegistroHostRoutes);
app.use("/api", authRegistroDriverRoutes);
app.use("/api", usuarioRoutes);
app.use("/api", visualizarDriverRoutes);
app.use("/api", visualizarRentersRoutes);
app.use("/api", listaDriversRoutes);
app.use("/api", twofaRoutes);
app.use("/api", editarDriverRoutes);

// Rutas de api - SpeedCode
app.use('/api', mapaRoutes);

//Rutas de api - QA-nTastic
app.use('/api', autoRoutes);

// Rutas de notificaciones
app.use("/api/notificaciones", createNotificacionRoutes());

// Endpoint SSE para notificaciones
app.get("/api/notificaciones/sse/:usuarioId", (req, res) => {
  sseController.conectar(req, res);
});

// Rutas básicas
app.get("/", (req, res) => {
  res.send("Bienvenido al back de REDIBO"); // Mensaje del segundo index
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Manejo de errores global
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error no manejado:", err);
  res.status(500).json({
    error: "Error interno del servidor",
    message: process.env.NODE_ENV === "development" ? err.message : "Algo salió mal"
  });
});

// Manejo de cierre del servidor
process.on("SIGTERM", () => {
  console.log("Cerrando servidor...");
  sseService.cleanup();
  prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("Cerrando servidor por SIGINT...");
  sseService.cleanup();
  prisma.$disconnect();
  process.exit(0);
});

// Inicializar servidor
async function startServer() {
  try {
    await ensureDefaultUbicacion();

    // Lógica de inicio condicional del segundo index
    if (process.env.NODE_ENV !== 'production') {
      const SERVER_PORT = process.env.PORT || 4000;
      app.listen(SERVER_PORT, () => {
        console.log(`🚀 Server running on port ${SERVER_PORT}`);
        console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
        console.log(`📡 Health check available at: http://localhost:${SERVER_PORT}/health`);
      });
    } else {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
        console.log(`📡 Health check available at: http://localhost:${PORT}/health`);
      });
    }
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

// Solo iniciar si este archivo es ejecutado directamente
if (require.main === module) {
  startServer();
}

export default app;