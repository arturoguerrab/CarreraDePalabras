import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import passport from "../passportConfig.js";
import config from "../config/env.js";

/**
 * Helper to format user response consistently.
 */
const formatUserResponse = (user) => ({
  id: user._id,
  email: user.email,
  username: user.username,
  firstName: user.firstName,
  lastName: user.lastName,
  rol: user.rol,
});

/**
 * Register a new user.
 */
export const registerUser = async (req, res, next) => {
  try {
    const { email, password, username, firstName, lastName } = req.body;

    const cleanUsername = username?.trim() || undefined;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        message: "Faltan campos obligatorios (Nombre, Apellido, Email, Password).",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El email ya está registrado." });
    }

    if (cleanUsername) {
      const existingUsername = await User.findOne({ username: cleanUsername });
      if (existingUsername) {
        return res.status(400).json({ message: "El nombre de usuario ya está en uso." });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPw = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPw,
      firstName,
      lastName,
      username: cleanUsername,
    });

    await newUser.save();

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: formatUserResponse(newUser),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "El email o username ya existe." });
    }
    next(error); // Delegate to global error handler
  }
};

/**
 * Log in a user using Local Strategy.
 */
export const loginUser = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({ message: info?.message || "Credenciales inválidas" });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);

      return res.status(200).json({
        message: "Inicio de sesión exitoso",
        user: formatUserResponse(user),
      });
    });
  })(req, res, next);
};

/**
 * Log out the current user.
 */
export const logoutUser = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ message: "Sesión cerrada exitosamente" });
  });
};

/**
 * Get current authenticated user session.
 */
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

/**
 * Set or update username for an authenticated user.
 */
export const setUsername = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "No estás autenticado." });
  }

  try {
    const { username } = req.body;

    if (!username || username.trim().length < 3) {
      return res.status(400).json({
        message: "El nombre de usuario debe tener al menos 3 caracteres.",
      });
    }

    const cleanUsername = username.trim();

    const existingUser = await User.findOne({ username: cleanUsername });
    if (existingUser) {
      return res.status(400).json({
        message: "Ese nombre de usuario ya está ocupado. Intenta con otro.",
      });
    }

    const user = await User.findById(req.user._id);
    user.username = cleanUsername;
    await user.save();

    res.status(200).json({
      message: "Nombre de usuario creado exitosamente.",
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Initiate Google OAuth authentication.
 */
export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

/**
 * Handle Google OAuth callback.
 */
export const googleAuthCallback = passport.authenticate("google", {
  failureRedirect: `${config.CLIENT_URL}/login?error=google`,
  successRedirect: `${config.CLIENT_URL}/lobby`,
});
