import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/userModel.js";
import passport from "../passportConfig.js";
import config from "../config/env.js";
import {
	sendVerificationEmail,
	sendPasswordResetEmail,
} from "../services/emailService.js";

// Normalizacion del Usuario
const formatUserResponse = (user, hasPassword) => ({
	id: user._id,
	email: user.email,
	username: user.username,
	firstName: user.firstName,
	lastName: user.lastName,
	rol: user.rol,
	isVerified: !!user.isVerified,
	hasPassword: hasPassword !== undefined ? hasPassword : !!user.password,
});

// Registro de Usuario
export const registerUser = async (req, res, next) => {
	try {
		const { email, password, username, firstName, lastName } = req.body;

		const cleanUsername = username?.trim() || undefined;

		if (!email || !password || !firstName || !lastName) {
			return res.status(400).json({
				message:
					"Faltan campos obligatorios (Nombre, Apellido, Email, Password).",
			});
		}

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: "El email ya está registrado." });
		}

		if (cleanUsername) {
			const existingUsername = await User.findOne({ username: cleanUsername });
			if (existingUsername) {
				return res
					.status(400)
					.json({ message: "El nombre de usuario ya está en uso." });
			}
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPw = await bcrypt.hash(password, salt);

		const verificationToken = crypto.randomBytes(32).toString("hex");

		const newUser = new User({
			email,
			password: hashedPw,
			firstName,
			lastName,
			username: cleanUsername,
			verificationToken,
		});

		await newUser.save();

		// Send verification email
		await sendVerificationEmail(
			newUser.email,
			newUser.firstName,
			verificationToken,
		);

		res.status(201).json({
			message: "Usuario registrado. Por favor verifica tu email.",
			user: formatUserResponse(newUser),
		});
	} catch (error) {
		if (error.code === 11000) {
			return res
				.status(400)
				.json({ message: "El email o username ya existe." });
		}
		next(error);
	}
};

// Inicio de sesion - Passport
export const loginUser = (req, res, next) => {
	passport.authenticate("local", (err, user, info) => {
		if (err) return next(err);

		if (!user) {
			return res
				.status(401)
				.json({ message: info?.message || "Credenciales inválidas" });
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

//Cierre de sesion
export const logoutUser = (req, res, next) => {
	req.logout((err) => {
		if (err) return next(err);
		res.json({ message: "Sesión cerrada exitosamente" });
	});
};

//Obtener el usuario con sesion activa
export const getUser = async (req, res) => {
	if (req.isAuthenticated()) {
		try {
			// Verificar si el usuario tiene contraseña (Google users no tienen)
			const userWithPwd = await User.findById(req.user._id).select("password");

			res.status(200).json({
				isLoggedIn: true,
				user: formatUserResponse(req.user, !!userWithPwd?.password),
			});
		} catch (error) {
			console.error("Error fetching user data:", error);
			res.status(500).json({ message: "Error interno del servidor" });
		}
	} else {
		res.status(200).json({ isLoggedIn: false });
	}
};

// Asignar username
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

// Inicio de sesion con Google
export const googleAuth = passport.authenticate("google", {
	scope: ["profile", "email"],
});

// Google OAuth callback.
export const googleAuthCallback = passport.authenticate("google", {
	failureRedirect: `${config.CLIENT_URL}/login?error=google`,
	successRedirect: `${config.CLIENT_URL}/lobby`,
});

// Actualizar perfil (Nombre, Apellido)
export const updateProfile = async (req, res, next) => {
	if (!req.isAuthenticated()) {
		return res.status(401).json({ message: "No estás autenticado." });
	}

	try {
		const { firstName, lastName } = req.body;

		if (!firstName || !lastName) {
			return res.status(400).json({
				message: "Nombre y apellido son requeridos.",
			});
		}

		const user = await User.findById(req.user._id);
		user.firstName = firstName.trim();
		user.lastName = lastName.trim();

		await user.save();

		res.status(200).json({
			message: "Perfil actualizado correctamente.",
			user: formatUserResponse(user),
		});
	} catch (error) {
		next(error);
	}
};

// Cambiar contraseña - Solo usuarios voluntarios
export const changePassword = async (req, res, next) => {
	if (!req.isAuthenticated()) {
		return res.status(401).json({ message: "No estás autenticado." });
	}

	try {
		const { currentPassword, newPassword } = req.body;

		if (!currentPassword || !newPassword) {
			return res.status(400).json({
				message: "Debes ingresar la contraseña actual y la nueva.",
			});
		}

		if (newPassword.length < 6) {
			return res.status(400).json({
				message: "La nueva contraseña debe tener al menos 6 caracteres.",
			});
		}

		const user = await User.findById(req.user._id).select("+password");

		if (!user.password && user.googleId) {
			return res.status(400).json({
				message: "Tu cuenta usa Google. No puedes cambiar la contraseña aquí.",
			});
		}

		const isMatch = await bcrypt.compare(currentPassword, user.password);
		if (!isMatch) {
			return res
				.status(400)
				.json({ message: "La contraseña actual es incorrecta." });
		}

		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(newPassword, salt);
		await user.save();

		res.status(200).json({
			message: "Contraseña actualizada exitosamente.",
		});
	} catch (error) {
		next(error);
	}
};

// Verificar email
export const verifyEmail = async (req, res, next) => {
	try {
		const { token } = req.params;

		const user = await User.findOne({ verificationToken: token });

		if (!user) {
			return res.status(400).json({ message: "Token inválido o expirado." });
		}

		user.isVerified = true;
		user.verificationToken = undefined;
		await user.save();

		res.status(200).json({ message: "Email verificado exitosamente." });
	} catch (error) {
		next(error);
	}
};

// Reenviar email de verificación
export const resendVerification = async (req, res, next) => {
	if (!req.isAuthenticated()) {
		return res.status(401).json({ message: "No estás autenticado." });
	}

	try {
		const user = await User.findById(req.user._id);

		if (user.isVerified) {
			return res.status(400).json({ message: "Tu cuenta ya está verificada." });
		}

		const verificationToken = crypto.randomBytes(32).toString("hex");
		user.verificationToken = verificationToken;
		await user.save();

		await sendVerificationEmail(user.email, user.firstName, verificationToken);

		res.status(200).json({ message: "Email de verificación reenviado." });
	} catch (error) {
		next(error);
	}
};

// Olvidé mi contraseña
export const forgotPassword = async (req, res, next) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email }).select("+password +googleId");

		if (!user) {
			return res.status(200).json({
				message: "Si el email existe, se ha enviado un enlace de recuperación.",
			});
		}

		const resetToken = crypto.randomBytes(32).toString("hex");
		user.resetPasswordToken = resetToken;
		user.resetPasswordExpires = Date.now() + 3600000; // 1 hora

		await user.save();

		await sendPasswordResetEmail(user.email, resetToken);

		res.status(200).json({
			message: "Si el email existe, se ha enviado un enlace de recuperación.",
		});
	} catch (error) {
		next(error);
	}
};

// Restablecer contraseña - Solo usuarios que olvidaron su contraseña
export const resetPassword = async (req, res, next) => {
	try {
		const { token } = req.params;
		const { newPassword } = req.body;

		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpires: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ message: "Token inválido o expirado." });
		}

		if (newPassword.length < 6) {
			return res
				.status(400)
				.json({ message: "La contraseña debe tener al menos 6 caracteres." });
		}

		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(newPassword, salt);
		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;

		await user.save();

		res.status(200).json({ message: "Contraseña restablecida exitosamente." });
	} catch (error) {
		next(error);
	}
};

// Establecer contraseña - Solo usuarios de Google
export const setPassword = async (req, res, next) => {
	if (!req.isAuthenticated()) {
		return res.status(401).json({ message: "No estás autenticado." });
	}

	try {
		const { newPassword } = req.body;
		const user = await User.findById(req.user._id).select("+password");

		if (user.password) {
			return res
				.status(400)
				.json({ message: "Ya tienes una contraseña establecida." });
		}

		if (!newPassword || newPassword.length < 6) {
			return res
				.status(400)
				.json({ message: "La contraseña debe tener al menos 6 caracteres." });
		}

		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(newPassword, salt);
		await user.save();

		res.status(200).json({
			message: "Contraseña establecida exitosamente.",
			user: formatUserResponse(user, true),
		});
	} catch (error) {
		next(error);
	}
};
