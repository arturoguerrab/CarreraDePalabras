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

// Profile Management
router.put("/update-profile", authController.updateProfile);
router.put("/change-password", authController.changePassword);
router.put("/set-password", authController.setPassword);

// Email Verification
router.get("/verify-email/:token", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerification);

// Password Recovery
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

export default router;
