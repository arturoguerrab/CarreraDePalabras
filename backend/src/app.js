// --- Imports ---
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import session from "express-session";
import cors from "cors";
import helmet from "helmet";
import MongoStore from "connect-mongo";

// Config & Services
import config from "./config/env.js";
import passport from "./passportConfig.js";
import { connectDB } from "./db.js";
import authRouter from "./routes/authRouter.js";
import socketHandler from "./socketHandler.js";

// --- App Initialization ---
const app = express();
const httpServer = createServer(app);

// Socket.IO Setup
const io = new Server(httpServer, {
  cors: {
    origin: config.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// --- Middlewares ---

// Foundation Security & Parsing
app.use(helmet());
app.use(cors({ origin: config.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Management
app.use(
  session({
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
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Authentication (Passport)
app.use(passport.initialize());
app.use(passport.session());

// --- Routes ---

// Local Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Auth Routes
app.use("/auth", authRouter);

// Socket.IO Logic
socketHandler(io);

// --- Error Handling ---
app.use((err, req, res, next) => {
  console.error("❌ App Error:", err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
      ...(config.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
});

// --- Server Startup ---
const startServer = async () => {
  try {
    await connectDB();
    httpServer.listen(config.PORT, () => {
      console.log(`🚀 Servidor listo en ${config.SERVER_URL}`);
      console.log(`📡 Socket.IO habilitado para: ${config.CLIENT_URL}`);
    });
  } catch (error) {
    console.error("❌ Error fatal al iniciar:", error);
    process.exit(1);
  }
};

startServer();
