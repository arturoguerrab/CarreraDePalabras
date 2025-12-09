import express from "express";
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import { createServer } from "http";
import { Server } from "socket.io";
import mainRouter from "./routes/mainRouter.js";
import authRouter from "./routes/authRouter.js";
import "dotenv/config";
import { connectDB } from "./db.js";
import cors from "cors";

// 2. Definir Constantes
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    // Debes especificar el origen exacto de tu cliente React (Vite)
    origin: "http://localhost:5173",
    // Métodos permitidos para las peticiones (Socket.IO usa GET y POST)
    methods: ["GET", "POST"],
    // Opcional, permite credenciales
    credentials: true,
  },
});
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(session({
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_DB_KEY,
        touchAfter: 24 * 3600, // Lazy session update (en segundos)
    }),
    secret: process.env.SESSION_SECRET,// Proporciona un valor por defecto si no está en .env
    resave: false,          // Evita guardar la sesión si no ha cambiado
    saveUninitialized: false, // Evita guardar sesiones de usuarios no autenticados
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 horas (opcional)
        secure: process.env.NODE_ENV === 'production', // true en producción (requiere HTTPS)
        httpOnly: true // Previene acceso desde JavaScript del cliente
    }
}));
app.use(passport.initialize());
app.use(passport.session());
// 4. Rutas
app.use("/lobby", mainRouter);
app.use("/auth", authRouter);

try {
  await connectDB();
  io.on("connection", (socket) => {
    console.log(`Un usuario conectado: ${socket.id}`);

    // 1. Unirse a una sala (por ejemplo, 'sala-1')
    socket.join("sala-de-juego-4-jugadores");

    // 2. Escuchar un evento de movimiento
    socket.on("movimiento", (data) => {
      // 3. Enviar el movimiento a todos los demás en la misma sala
      socket.to("sala-de-juego-4-jugadores").emit("actualizacion_juego", {
        id: socket.id,
        posicion: data,
      });
    });

    socket.on("disconnect", () => {
      console.log(`Usuario desconectado: ${socket.id}`);
    });
  });

  // 5. Iniciar el Servidor
  httpServer.listen(PORT, () => {
    console.log(`Servidor Express/Socket.IO escuchando en puerto ${PORT}`);
  });
} catch (error) {
  console.log(error);
}
