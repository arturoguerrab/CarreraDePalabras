import { Router } from "express";
import * as authController from "../controllers/authController.js";

const router = Router();

// Local Auth
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.get("/logout", authController.logoutUser);
router.get("/user", authController.getUser);
router.post("/set-username", authController.setUsername);

// Google OAuth
router.get("/google", authController.googleAuth);
router.get("/google/callback", authController.googleAuthCallback);

export default router;
