// Importar módulos
import express from "express";
import session from "express-session";
import passport from "./passportConfig.js";
import cors from "cors";
import "dotenv/config";
import helmet from "helmet"; 
import MongoStore from "connect-mongo"; 

// Importacion de servidores
import { createServer } from "http";
import { Server } from "socket.io";

// Importacion de base de datos
import { connectDB } from "./db.js";

// Importacion de rutas
import mainRouter from "./routes/mainRouter.js";
import authRouter from "./routes/authRouter.js";
import socketHandler from "./socketHandler.js";

// --- Configuración y Constantes ---
const app = express();
const httpServer = createServer(app);

// ENV Variables
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const MONGO_DB_URI = process.env.MONGO_DB_URI;
const NODE_ENV = process.env.NODE_ENV;

// Verificación de variables de entorno críticas para el funcionamiento
if (!SESSION_SECRET || !MONGO_DB_URI) {
	console.error(
		"❌ Error: Las variables de entorno SESSION_SECRET y MONGO_DB_URI son obligatorias."
	);
	process.exit(1);
}

const io = new Server(httpServer, {
	cors: {
		origin: CLIENT_URL,
		methods: ["GET", "POST"],
		credentials: true,
	},
});

// --- Middlewares ---
// Middlewares de seguridad y parsing
app.use(helmet()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: CLIENT_URL, credentials: true }));

// Configuración de la sesión con almacenamiento en MongoDB para producción
app.use(
	session({
		secret: SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		// Se usa MongoStore para guardar las sesiones en la base de datos
		store: MongoStore.create({
			mongoUrl: MONGO_DB_URI,
			collectionName: "sessions", // Nombre de la colección para las sesiones
		}),
		cookie: {
			httpOnly: true, // La cookie no es accesible desde JavaScript del cliente
			secure: NODE_ENV === "production", // Usar cookies seguras en producción (HTTPS)
			maxAge: 1000 * 60 * 60 * 24, // La sesión dura 1 día
		},
	})
);

// Middlewares de autenticación
app.use(passport.initialize());
app.use(passport.session());

// --- Rutas ---
app.use("/lobby", mainRouter);
app.use("/auth", authRouter);

// --- Lógica de Socket.IO (Modularizada) ---
socketHandler(io);

// --- Inicio del Servidor ---
const startServer = async () => {
	try {
		await connectDB();
		httpServer.listen(PORT, () => {
			console.log(`🚀 Servidor Express/Socket.IO escuchando en puerto ${PORT}`);
		});
	} catch (error) {
		console.error("❌ Error al iniciar el servidor:", error);
		process.exit(1);
	}
};

startServer();
