import mongoose from "mongoose";
import config from "./config/env.js";

// Eventos Mongoose
mongoose.connection.on("connected", () => {
  console.log("MongoDB: Conexión establecida");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB: Error de conexión:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB: Conexión perdida");
});

// Cierre de la conexion
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB: Conexión cerrada (SIGINT / Ctrl + C)");
    process.exit(0);
  } catch (error) {
    console.error("MongoDB: Error al cerrar la conexión:", error.message);
    process.exit(1);
  }
});

// Iniciar la conexion a la base de datos
export const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGO_DB_URI);
  } catch (error) {
    console.error("MongoDB: Falló la conexión inicial:", error.message);
    process.exit(1);
  }
};
