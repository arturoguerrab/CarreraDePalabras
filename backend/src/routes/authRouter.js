import {
	getUser,
	googleAuth,
	googleAuthCallback,
	loginUser,
	logoutUser,
	registerUser,
} from "../controllers/authController.js";
import { Router } from "express";
import passport from "passport";

const router = Router();

// Rutas de autenticación local
router.post("/register", registerUser);
router.post("/login", passport.authenticate("local"), loginUser);
router.get("/user", getUser);

//Ruta para cerrar sesión
router.get("/logout", logoutUser);

// Rutas de autenticación con Google
router.get("/google", googleAuth);
router.get("/google/callback", googleAuthCallback);

export default router;
