import mongoose from "mongoose";

// 1. Definición del Esquema
// El Schema define la estructura de los documentos en la colección 'users'.
const userSchema = new mongoose.Schema(
  {
    // Campo 'username' (Opcional)
    username: {
      type: String,
      trim: true,
      unique: true, // Evita usernames duplicados reales
      sparse: true, // Permite que múltiples usuarios no tengan username (sean undefined)
      default: undefined,
      set: (v) => (v === "" ? undefined : v), // Convierte la cadena vacía "" a undefined antes de guardar
    },
    // Campo 'firstName'
    firstName: {
      type: String,
      trim: true,
    },
    // Campo 'lastName'
    lastName: {
      type: String,
      trim: true,
    },

    // Campo 'email'
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true, // Asegura que no haya dos usuarios con el mismo email
      lowercase: true,
      trim: true,
      // Validación simple de formato de email (se puede mejorar)
      match: [/.+@.+\..+/, "Por favor, introduce un email válido"],
    },

    // Campo 'contrasena'
    // IMPORTANTE: Aquí se guardará el HASH de la contraseña, NUNCA el texto plano.
    password: {
      type: String,
      // Hacemos que NO sea requerido si usamos autenticación de terceros
      required: function () {
        return !this.googleId;
      },
      minlength: 6,
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Permite que varios documentos no tengan valor (null), es decir, que no sea obligatorio
    },

    // Campo 'rol' (para control de acceso, ej. 'user', 'admin')
    rol: {
      type: String,
      enum: ["user", "admin"], // Solo permite estos dos valores
      default: "user",
    },

    // Campo 'createdAt' (gestionado automáticamente por Mongoose)
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // 2. Opciones del Esquema
    // timestamps: true agregaría automáticamente createdAt y updatedAt
    // pero aquí lo definimos explícitamente para mayor control.
  }
);

// 3. Creación del Modelo
// Mongoose tomará 'User' y creará una colección llamada 'users' (en plural y minúsculas).
const User = mongoose.model("User", userSchema);

// --- SOLUCIÓN AL ERROR 400 DE REGISTRO ---
// Sincronizar índices para asegurar que 'sparse' se aplique correctamente.
// Esto corrige el error de "duplicado" cuando el username está vacío.
User.syncIndexes().then(() => {
  console.log("✅ Índices de usuarios sincronizados correctamente.");
}).catch(err => {
  console.error("❌ Error al sincronizar índices:", err);
});

export default User;
