// connection.js (o donde manejes la conexión)
import mongoose from 'mongoose';
import 'dotenv/config'; // Asegura que las variables de entorno estén cargadas

// Usar URI completa si está definida, si no construirla con host/port/dbname
const uri = process.env.MONGO_DB_KEY 
export async function connectDB() {
    try {
        await mongoose.connect(uri);
        console.log(`✅ Conectado a MongoDB`);
    } catch (error) {
        console.error("❌ Falló la conexión a MongoDB:", error.message);
        process.exit(1);
    }
}