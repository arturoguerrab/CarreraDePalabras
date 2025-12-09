import mongoose from "mongoose";
import "dotenv/config";

const uri = process.env.MONGO_DB_URI;

// Se verifica la Uri de conexión antes de intentar conectar.
if (!uri) {
	console.error(
		"❌ La URI de conexión a MongoDB no está definida en las variables de entorno."
	);
	process.exit(1);
}

// Manejo de eventos de conexión para monitorear el estado de la conexión.
mongoose.connection.on("connected", () => {
	console.log("✅ Mongoose se ha conectado a MongoDB.");
});

mongoose.connection.on("error", (err) => {
	console.error("❌ Error en la conexión de Mongoose:", err.message);
});

mongoose.connection.on("disconnected", () => {
	console.warn("⚠️ Mongoose se ha desconectado de MongoDB.");
});

// Manejo de la desconexión al terminar la aplicación (Ctrl+C).
process.on("SIGINT", async () => {
	await mongoose.connection.close();
	console.log(
		"🔌 Conexión a MongoDB cerrada por terminación de la aplicación."
	);
	process.exit(0);
});

// Establece la conexión con la base de datos de MongoDB.
export const connectDB = async () => {
	try {
		await mongoose.connect(uri);
	} catch (error) {
		console.error("❌ Falló la conexión inicial a MongoDB:", error.message);
		process.exit(1);
	}
};
