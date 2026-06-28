import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Local Auth
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.get("/logout", authController.logoutUser);
router.get("/user", protect, authController.getUser);
router.post("/set-username", protect, authController.setUsername);

// Google OAuth
router.get("/google", authController.googleAuth);
router.get("/google/callback", authController.googleAuthCallback);

// Profile Management
router.put("/update-profile", protect, authController.updateProfile);
router.put("/change-password", protect, authController.changePassword);
router.put("/set-password", protect, authController.setPassword);

// Email Verification
router.get("/verify-email/:token", authController.verifyEmail);
router.post("/resend-verification", protect, authController.resendVerification);

// Password Recovery
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

export default router;
