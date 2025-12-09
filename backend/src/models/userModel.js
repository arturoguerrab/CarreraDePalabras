import mongoose from "mongoose";

// 1. Definición del Esquema
// El Schema define la estructura de los documentos en la colección 'users'.
const userSchema = new mongoose.Schema(
  {
    // Campo 'nombre'
    nombre: {
        type: String,
        required: false, // Es opcional, puede que un usuario se registre solo con email o venga de un proveedor OAuth
        trim: true, // Elimina espacios en blanco al inicio y al final
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

export default User;
