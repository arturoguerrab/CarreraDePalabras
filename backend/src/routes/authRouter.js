import { Router } from "express";
import {
  getUser,
  googleAuth,
  googleAuthCallback,
  loginUser,
  logoutUser,
  registerUser,
  setUsername,
} from "../controllers/authController.js";

const router = Router();

// Rutas de autenticación local
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);
router.get("/user", getUser);

// Ruta para completar el perfil (Google Login)
router.post("/set-username", setUsername);

// Ruta para cerrar sesión
router.get("/logout", logoutUser);

// Rutas de autenticación con Google
router.get("/google", googleAuth);
router.get("/google/callback", googleAuthCallback);

export default router;
