import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import passport from "../passportConfig.js";
import "dotenv/config";

export const registerUser = async (req, res) => {
	try {
		const { email, password, username, firstName, lastName } = req.body;

		// Sanitizar username: si es cadena vacía o espacios, lo forzamos a undefined
		const cleanUsername = (username && username.trim() !== "") ? username.trim() : undefined;

		// Validaciones de campos obligatorios
		if (!email || !password || !firstName || !lastName) {
			return res.status(400).json({
				message: "Faltan campos obligatorios (Nombre, Apellido, Email, Password).",
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
			email: email,
			password: hashedPw,
			firstName,
			lastName,
			username: cleanUsername, // Usamos la variable ya sanitizada
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
				username: newUser.username,
				firstName: newUser.firstName,
				lastName: newUser.lastName,
				rol: newUser.rol,
			},
		});
	} catch (error) {
		// Mongoose maneja errores de validación y unicidad
		if (error.code === 11000) {
			console.error("Error de duplicado (11000):", error.keyPattern); // Ver en consola qué campo falla
			return res.status(400).json({ message: "El email o username ya existe." });
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
				username: req.user.username,
				firstName: req.user.firstName,
				lastName: req.user.lastName,
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
