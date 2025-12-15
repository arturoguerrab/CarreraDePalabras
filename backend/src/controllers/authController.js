import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import passport from "../passportConfig.js";

export const registerUser = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Hasheo de contraseña
		const salt = await bcrypt.genSalt(10);
		const hashedPw = await bcrypt.hash(password, salt);

		// Crea una nueva instancia del modelo
		const newUser = new User({
			email: email,
			password: hashedPw,
			rol: "user", // Por defecto
		});

		// Guarda el documento en la base de datos
		await newUser.save();

		// Respuesta exitosa
		res.status(201).json({
			message: "Usuario registrado exitosamente",
			user: {
				id: newUser._id,
				email: newUser.email,
				rol: newUser.rol,
			},
		});
	} catch (error) {
		// Mongoose maneja errores de validación y unicidad
		if (error.code === 11000) {
			return res.status(400).json({ message: "El email ya está registrado." });
		}
		res
			.status(500)
			.json({ message: "Error interno del servidor", error: error.message });
	}
};

export const loginUser = (req, res) => {
	res.status(200).json({
		message: "Inicio de sesión exitoso",
		user: {
			id: req.user._id,
			email: req.user.email,
		},
	});
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
			user: {
				id: req.user._id, // Consistently use 'id'
				email: req.user.email,
				// Agrega otras propiedades que necesites, como 'rol' si aplica
			},
		});
	} else {
		res.status(200).json({ isLoggedIn: false });
	}
};

export const googleAuth = passport.authenticate("google", {
	scope: ["profile", "email"],
});

export const googleAuthCallback = passport.authenticate("google", {
	failureRedirect: `${
		process.env.CLIENT_URL || "http://localhost:5173"
	}/login?error=google`,
	successRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/lobby`,
});
