import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import passport from "../passportConfig.js";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Helper para formatear la respuesta del usuario de manera consistente
const formatUserResponse = (user) => ({
  id: user._id,
  email: user.email,
  username: user.username,
  firstName: user.firstName,
  lastName: user.lastName,
  rol: user.rol,
});

export const registerUser = async (req, res) => {
  try {
    const { email, password, username, firstName, lastName } = req.body;

    // Sanitizar username: si es cadena vacía o espacios, lo forzamos a undefined
    const cleanUsername = username?.trim() || undefined;

    // Validaciones de campos obligatorios
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        message:
          "Faltan campos obligatorios (Nombre, Apellido, Email, Password).",
      });
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El email ya está registrado." });
    }

    // Verificar username si se proporcionó
    if (cleanUsername) {
      const existingUsername = await User.findOne({ username: cleanUsername });
      if (existingUsername) {
        return res
          .status(400)
          .json({ message: "El nombre de usuario ya está en uso." });
      }
    }

    // Hasheo de contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPw = await bcrypt.hash(password, salt);

    // Crea una nueva instancia del modelo
    const newUser = new User({
      email,
      password: hashedPw,
      firstName,
      lastName,
      username: cleanUsername,
    });

    // Guarda el documento en la base de datos
    await newUser.save();

    // Respuesta exitosa
    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: formatUserResponse(newUser),
    });
  } catch (error) {
    // Mongoose maneja errores de validación y unicidad
    if (error.code === 11000) {
      console.error("Error de duplicado (11000):", error.keyPattern); // Ver en consola qué campo falla
      return res
        .status(400)
        .json({ message: "El email o username ya existe." });
    }
    res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

export const loginUser = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    // 1. Errores internos
    if (err)
      return res
        .status(500)
        .json({ message: "Error interno del servidor", error: err.message });

    // 2. Fallo de autenticación
    if (!user)
      return res
        .status(401)
        .json({ message: info?.message || "Credenciales inválidas" });

    // 3. Iniciar sesión
    req.logIn(user, (err) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Error al iniciar sesión", error: err.message });

      return res.status(200).json({
        message: "Inicio de sesión exitoso",
        user: formatUserResponse(user),
      });
    });
  })(req, res, next);
};

export const logoutUser = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error al cerrar sesión", error: err.message });
    }
    console.log("Sesión cerrada exitosamente");
    res.json({ message: "Sesión cerrada exitosamente" });
  });
};

export const getUser = (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({
      isLoggedIn: true,
      user: formatUserResponse(req.user),
    });
  } else {
    res.status(200).json({ isLoggedIn: false });
  }
};

export const setUsername = async (req, res) => {
  // 1. Verificar que el usuario esté logueado (la sesión de Google ya debe existir)
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "No estás autenticado." });
  }

  try {
    const { username } = req.body;

    // 2. Validaciones básicas
    if (!username || username.trim().length < 3) {
      return res.status(400).json({
        message: "El nombre de usuario debe tener al menos 3 caracteres.",
      });
    }

    const cleanUsername = username.trim();

    // 3. Verificar si ya existe en la base de datos
    const existingUser = await User.findOne({ username: cleanUsername });
    if (existingUser) {
      return res.status(400).json({
        message: "Ese nombre de usuario ya está ocupado. Intenta con otro.",
      });
    }

    // 4. Actualizar el usuario actual
    const user = await User.findById(req.user._id);
    user.username = cleanUsername;
    await user.save();

    // 5. Devolver el usuario actualizado para que el frontend actualice el estado
    res.status(200).json({
      message: "Nombre de usuario creado exitosamente.",
      user: formatUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al guardar el nombre de usuario.",
      error: error.message,
    });
  }
};

export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const googleAuthCallback = passport.authenticate("google", {
  failureRedirect: `${CLIENT_URL}/login?error=google`,
  successRedirect: `${CLIENT_URL}/lobby`,
});
