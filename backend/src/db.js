import mongoose from "mongoose";
import config from "./config/env.js";

/**
 * Event handlers for monitoring Mongoose connection state.
 */
mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB: Conexión establecida");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB: Error de conexión:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB: Conexión perdida");
});

/**
 * Ensures clean shutdown of the database connection on app termination.
 */
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("🔌 MongoDB: Conexión cerrada (SIGINT)");
    process.exit(0);
  } catch (error) {
    console.error("❌ MongoDB: Error al cerrar la conexión:", error.message);
    process.exit(1);
  }
});

/**
 * Initializes the database connection using the URI from centralized config.
 */
export const connectDB = async () => {
  try {
    // Note: Validation is now handled in config/env.js
    await mongoose.connect(config.MONGO_DB_URI);
  } catch (error) {
    console.error("❌ MongoDB: Falló la conexión inicial:", error.message);
    // Explicitly re-throw or exit depending on desired fallback strategy
    process.exit(1);
  }
};
