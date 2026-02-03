// Importaciones
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import session from "express-session";
import cors from "cors";
import helmet from "helmet";
import MongoStore from "connect-mongo";
import rateLimit from "express-rate-limit";
import config from "./config/env.js";
import passport from "./passportConfig.js";
import { connectDB } from "./db.js";
import authRouter from "./routes/authRouter.js";
import socketHandler from "./socketHandler.js";
import { startCleanupJob } from "./services/cleanupService.js";

// Inicio del APP
const app = express();
const httpServer = createServer(app);

// Config Socket.IO
const io = new Server(httpServer, {
	cors: {
		origin: config.CLIENT_URL,
		methods: ["GET", "POST"],
		credentials: true,
	},
});

// Middlewares

// Seguridad y parseo
app.use(helmet());
app.use(cors({ origin: config.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 20,
	message: { message: "Demasiados intentos. Inténtalo de nuevo más tarde." },
});

// Manejo de sesion
const sessionMiddleware = session({
	secret: config.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	store: MongoStore.create({
		mongoUrl: config.MONGO_DB_URI,
		collectionName: "sessions",
	}),
	cookie: {
		httpOnly: true,
		secure: config.NODE_ENV === "production",
		maxAge: 1000 * 60 * 60 * 24,
	},
});

app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);

// Auth(Passport)
io.engine.use(passport.initialize());
io.engine.use(passport.session());
app.use(passport.initialize());
app.use(passport.session());

// Routes

// Test
app.get("/health", (req, res) => {
	res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Auth
app.use("/auth", authLimiter, authRouter);

// Socket.IO
socketHandler(io);

// Manejo de error
app.use((err, req, res, next) => {
	console.error("App Error:", err.stack);
	res.status(err.status || 500).json({
		error: {
			message: err.message || "Internal Server Error",
			...(config.NODE_ENV === "development" && { stack: err.stack }),
		},
	});
});

// Inicio del servidor
const startServer = async () => {
	try {
		await connectDB();
		startCleanupJob(); // Iniciar servicio de limpieza
		httpServer.listen(config.PORT, () => {
			console.log(`Servidor listo en ${config.SERVER_URL}`);
			console.log(`Socket.IO habilitado para: ${config.CLIENT_URL}`);
		});
	} catch (error) {
		console.error("Error fatal al iniciar:", error);
		process.exit(1);
	}
};

startServer();
