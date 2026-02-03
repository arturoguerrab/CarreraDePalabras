import { customAlphabet } from "nanoid";
import Room from "../models/roomModel.js";
import logger from "../utils/logger.js";

const deletionTimers = new Map();

// Programar borrado de sala si se queda vacía - 30 segundos de gracia
const scheduleRoomDeletion = (roomId) => {
	if (deletionTimers.has(roomId)) return;

	logger.info(
		`Sala ${roomId} sin jugadores. Se borrará en 30s si nadie se une.`,
	);
	const timer = setTimeout(async () => {
		try {
			const room = await Room.findOne({ roomId });
			if (room && room.players.length === 0) {
				await Room.deleteOne({ roomId });
				logger.info(
					`Sala ${roomId} eliminada definitivamente por inactividad.`,
				);
			}
		} catch (error) {
			logger.error(`Error borrando sala ${roomId}:`, error);
		} finally {
			deletionTimers.delete(roomId);
		}
	}, 30000); // 30 segundos de gracia

	deletionTimers.set(roomId, timer);
};

// Cancelar borrado de sala si se une un jugador
const cancelRoomDeletion = (roomId) => {
	if (deletionTimers.has(roomId)) {
		clearTimeout(deletionTimers.get(roomId));
		deletionTimers.delete(roomId);
		logger.info(`Eliminación de sala ${roomId} cancelada (jugador unido).`);
	}
};

// Generar ID de sala - nanoid
const generateRoomId = customAlphabet("0123456789", 4);

// Crear sala
export const createRoom = async (user, socketId) => {
	try {
		const roomId = generateRoomId();
		const newRoom = await Room.create({
			roomId,
			players: [
				{
					id: socketId,
					email: user.email,
					username: user.username,
					firstName: user.firstName,
					ready: false,
				},
			],
			lastActivity: new Date(),
		});
		return newRoom.roomId;
	} catch (error) {
		logger.error("Error creating room:", error);
		throw error;
	}
};

// Obtener sala - usado en multiples funciones
export const getRoom = async (roomId) => {
	try {
		return await Room.findOne({ roomId });
	} catch (error) {
		logger.error(`Error fetching room ${roomId}:`, error);
		return null;
	}
};

// Unirse a sala
export const joinRoom = async (roomId, user, socketId) => {
	try {
		cancelRoomDeletion(roomId);

		// Verificar existencia básica y estado
		const roomCheck = await Room.findOne({ roomId }).select(
			"isPlaying lastRoundResults config",
		);
		if (!roomCheck) {
			return { error: "La sala no existe." };
		}

		if (roomCheck.isPlaying) {
			const exists = await Room.countDocuments({
				roomId,
				"players.email": user.email,
			});
			if (!exists) return { error: "La partida ya ha comenzado." };
		}

		let room = await Room.findOneAndUpdate(
			{ roomId, "players.email": user.email },
			{
				$set: {
					"players.$.id": socketId,
					"players.$.username": user.username, // Actualizar datos por si cambiaron
					"players.$.firstName": user.firstName,
					"players.$.connected": true, // Marcar como conectado
					lastActivity: new Date(),
				},
			},

			{ new: true },
		);

		if (room) {
			logger.info(
				`Jugador ${user.email} reconectado/actualizado en sala ${roomId}`,
			);
			return { room, isNewJoin: false };
		}

		const isGameOver =
			!roomCheck.isPlaying &&
			roomCheck.lastRoundResults &&
			roomCheck.config.currentRound >= roomCheck.config.totalRounds;

		room = await Room.findOneAndUpdate(
			{ roomId, "players.email": { $ne: user.email } },
			{
				$push: {
					players: {
						id: socketId,
						email: user.email,
						username: user.username,
						firstName: user.firstName,
						ready: false,
						dismissedResults: isGameOver ? true : false, // Si es Game Over, ya "vio" (saltó) los resultados
					},
				},
				$set: { lastActivity: new Date() },
			},
			{ new: true },
		);

		if (room) {
			logger.info(`Jugador ${user.email} unido a sala ${roomId}`);
			return { room, isNewJoin: true };
		}

		// Verificamos si la sala existe y tiene al jugador
		room = await Room.findOne({ roomId });
		if (!room)
			return { error: "Error al unirse a la sala (posiblemente eliminada)." };

		return { room, isNewJoin: false };
	} catch (error) {
		logger.error("Error joining room:", error);
		return { error: "Error al unirse a la sala." };
	}
};

// Eliminar jugador y programar borrado si se queda vacía
export const removePlayer = async (roomId, socketId) => {
	try {
		const room = await Room.findOneAndUpdate(
			{ roomId },
			{ $pull: { players: { id: socketId } } },
			{ new: true },
		);

		if (room && room.players.length === 0) {
			scheduleRoomDeletion(roomId);
			return null;
		}

		return room;
	} catch (error) {
		logger.error("Error removing player:", error);
		return null;
	}
};

// Eliminar jugador por email
export const removePlayerByEmail = async (roomId, email) => {
	try {
		const room = await Room.findOneAndUpdate(
			{ roomId },
			{ $pull: { players: { email } } },
			{ new: true },
		);

		if (room && room.players.length === 0) {
			scheduleRoomDeletion(roomId);
			return null;
		}

		return room;
	} catch (error) {
		logger.error("Error removing player by email:", error);
		return null;
	}
};

// Eliminar jugador por socketId
export const removePlayerBySocketId = async (socketId) => {
	try {
		// Encontrar la sala primero para poder devolverla (necesario para el frontend)
		let room = await Room.findOne({ "players.id": socketId });
		if (!room) return null;

		const player = room.players.find((p) => p.id === socketId);
		if (!player) return null;

		// Si el juego está en curso O es Game Over (para mantener resultados/estado), solo marcamos desconectado
		const isGameOverState =
			!room.isPlaying &&
			room.lastRoundResults &&
			room.config.currentRound >= room.config.totalRounds;

		if (room.isPlaying || isGameOverState) {
			room = await Room.findOneAndUpdate(
				{ roomId: room.roomId, "players.id": socketId },
				{ $set: { "players.$.connected": false } },
				{ new: true },
			);
			logger.info(
				`Jugador ${player.email} desconectado (marcado como inactivo) de sala ${room.roomId}. (Game Over: ${isGameOverState})`,
			);
		} else {
			// Si NO están jugando y NO es Game Over (Lobby puro), eliminamos
			room = await Room.findOneAndUpdate(
				{ roomId: room.roomId },
				{ $pull: { players: { id: socketId } } },
				{ new: true },
			);

			if (room && room.players.length === 0) {
				scheduleRoomDeletion(room.roomId);
			}
		}

		return {
			roomId: room.roomId,
			// Si la sala se borró (0 jugadores), devolvemos null en 'room' o manejamos según frontend
			room: room && room.players.length > 0 ? room : null,
			player,
		};
	} catch (error) {
		logger.error("Error removing player by socket:", error);
		return null;
	}
};

// Alternar estado de listo
export const togglePlayerReady = async (roomId, socketId) => {
	try {
		const room = await Room.findOne({ roomId });
		if (!room) return null;

		const player = room.players.find((p) => p.id === socketId);
		if (player) {
			player.ready = !player.ready;
			await room.save();
		}
		return room;
	} catch (error) {
		logger.error("Error toggling ready:", error);
		return null;
	}
};

// Resetear estado de listo
export const resetReadiness = async (roomId) => {
	try {
		await Room.updateOne({ roomId }, { $set: { "players.$[].ready": false } });
	} catch (error) {
		logger.error("Error resetting readiness:", error);
	}
};

// Función para gestión del Timer persistente
export const setRoomTimer = async (roomId, startTime) => {
	try {
		await Room.updateOne({ roomId }, { $set: { timerStart: startTime } });
	} catch (error) {
		logger.error("Error setting room timer:", error);
	}
};

// Actualizar jugador en sala por socketId
export const updatePlayerInRoom = async (roomId, socketId, updates) => {
	try {
		const updateFields = {};
		for (const [key, value] of Object.entries(updates)) {
			updateFields[`players.$.${key}`] = value;
		}

		await Room.updateOne(
			{ roomId, "players.id": socketId },
			{ $set: updateFields },
		);
	} catch (error) {
		logger.error("Error updating player in room:", error);
	}
};

// Actualizar jugador en sala por email
export const updatePlayerByEmail = async (roomId, email, updates) => {
	try {
		const updateFields = {};
		for (const [key, value] of Object.entries(updates)) {
			updateFields[`players.$.${key}`] = value;
		}

		const result = await Room.updateOne(
			{ roomId, "players.email": email },
			{ $set: updateFields },
		);
	} catch (error) {
		logger.error("Error updating player in room by email:", error);
	}
};
