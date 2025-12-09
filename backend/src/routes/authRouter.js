import { loginUser, registerUser } from "../controllers/authController.js";
import { Router } from "express";
import passport from "../passportConfig.js";
const router = Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login/failure",
    successRedirect: "/profile",
  })
);
router.get("/user", (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({ isLoggedIn: true, user: req.user });
  }
  res.json({ isLoggedIn: false });
});
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error al cerrar sesión', error: err.message });
    }
    res.json({ message: 'Sesión cerrada exitosamente' });
  });
});
export default router;
