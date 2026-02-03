import * as roomService from "../services/roomService.js";

// Verificar autenticación
export const requireAuth = (socket) => {
	const user = socket.request.user;
	if (!user) {
		socket.emit("error_joining", "Usuario no autenticado");
		return null;
	}
	return user;
};

// Obtener sala o enviar error
export const fetchRoomOrError = async (socket, roomId) => {
	const room = await roomService.getRoom(roomId);
	if (!room) {
		socket.emit("error_joining", "La sala ha expirado o no existe.");
		return null;
	}
	return room;
};
