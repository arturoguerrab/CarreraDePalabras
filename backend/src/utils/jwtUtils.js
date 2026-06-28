import jwt from "jsonwebtoken";
import config from "../config/env.js";

// Generar un JWT válido por 7 días
export const generateToken = (userId) => {
	return jwt.sign({ id: userId }, config.JWT_SECRET, {
		expiresIn: "7d",
	});
};

// Verificar un JWT y devolver el payload decodificado
export const verifyToken = (token) => {
	try {
		return jwt.verify(token, config.JWT_SECRET);
	} catch (error) {
		return null;
	}
};
