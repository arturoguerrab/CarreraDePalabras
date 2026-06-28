import User from "../models/userModel.js";
import { verifyToken } from "../utils/jwtUtils.js";

export const protect = async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	}

	if (!token) {
		return res.status(401).json({ message: "No autorizado, no hay token" });
	}

	try {
		const decoded = verifyToken(token);
		
		if (!decoded) {
			return res.status(401).json({ message: "No autorizado, token inválido" });
		}

		const user = await User.findById(decoded.id);

		if (!user) {
			return res.status(401).json({ message: "No autorizado, usuario no encontrado" });
		}

		req.user = user;
		next();
	} catch (error) {
		console.error("Auth Middleware Error:", error);
		res.status(401).json({ message: "No autorizado, fallo en el token" });
	}
};
