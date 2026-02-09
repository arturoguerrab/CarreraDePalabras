import * as roomService from "../services/roomService.js";
import { requireAuth } from "../utils/socketUtils.js";
import Trial from "../models/trialModel.js";

// funcion para emitir la lista de jugadores actualizada
export const emitPlayerList = (io, roomId, players) => {
	io.to(roomId).emit(
		"update_player_list",
		players.map((p) => ({
			email: p.email,
			id: p.id,
			username: p.username,
			firstName: p.firstName,
			displayName: p.username || p.firstName || p.email,
			ready: p.ready,
			connected: p.connected,
			judgmentTokens: p.judgmentTokens,
		})),
	);
};

// Manejar la creacion de la sala - Emit principal 'room_created'
export const handleCreateRoom = async (io, socket) => {
	const user = requireAuth(socket);
	if (!user) return;

	try {
		const roomId = await roomService.createRoom(user, socket.id);
		socket.join(roomId);

		const room = await roomService.getRoom(roomId);

		emitPlayerList(io, roomId, room.players);
		socket.emit("room_created", roomId);
	} catch (error) {
		socket.emit("error_joining", "Error al crear la sala");
	}
};

// Manejar la creacion de la sala - Emit principal 'joined_room'
export const handleJoinRoom = async (io, socket, { room_id }) => {
	const user = requireAuth(socket);
	if (!user) return;

	try {
		const { room, isNewJoin, error } = await roomService.joinRoom(
			room_id,
			user,
			socket.id,
		);
		if (error || !room) {
			return socket.emit("error_joining", error || "No se pudo unir a la sala");
		}

		socket.join(room_id);
		socket.emit("joined_room", room_id);
		emitPlayerList(io, room_id, room.players);

		// RECUPERACIÓN DE ESTADO: Si el juego está en curso, enviamos el estado actual
		if (room.isPlaying) {
			let remainingTime = 60; // Default

			if (room.timerStart) {
				const elapsedSeconds = Math.floor(
					(Date.now() - new Date(room.timerStart).getTime()) / 1000,
				);
				remainingTime = Math.max(0, 60 - elapsedSeconds);
			}

			if (room.isCalculating) {
				socket.emit("calculating_results");
			} else if (room.stoppedBy) {
				socket.emit("force_submit", { stoppedBy: room.stoppedBy });
			} else if (room.timerStart) {
				socket.emit("game_started", {
					letter: room.currentLetter,
					categories: room.currentCategories,
					roundDuration: remainingTime,
					isRecovery: true,
				});
			} else {
				if (room.lastRoundResults) {
					socket.emit("round_results", {
						results: room.lastRoundResults,
						scores: room.scores,
						isGameOver: false,
						round: room.config.currentRound - 1,
						totalRounds: room.config.totalRounds,
						stoppedBy: null,
						isRecovery: true,
					});
				}
			}
		} else if (room.lastRoundResults) {
			const currentName = user.username || user.firstName;
			const playerInRoom = room.players.find((p) => p.email === user.email);

			const participated = room.lastRoundResults.some((catResult) =>
				catResult.respuestas.some((r) => r.nombre === currentName),
			);

			const dismissed = playerInRoom?.dismissedResults;

			if (
				!isNewJoin &&
				participated &&
				!dismissed &&
				room.config.currentRound >= room.config.totalRounds
			) {
				socket.emit("round_results", {
					results: room.lastRoundResults,
					scores: room.scores,
					isGameOver: true,
					round: room.config.totalRounds,
					totalRounds: room.config.totalRounds,
					stoppedBy: null,
					isRecovery: true,
				});
			}
		}

		// 3. TRIAL RECOVERY: Check if there is an active trial
		const activeTrial = await Trial.findOne({
			roomId: room_id,
			status: "pending",
		});
		if (activeTrial) {
			// Identity Fix: If this is the challenger returning, update their ID
			if (
				activeTrial.challengerEmail &&
				activeTrial.challengerEmail === user.email
			) {
				activeTrial.challengerId = socket.id;
				await activeTrial.save();
			}

			const challenger = room.players.find(
				(p) => p.id === activeTrial.challengerId,
			);
			socket.emit("trial_started", {
				trialId: activeTrial._id,
				challengerName:
					challenger?.username || challenger?.firstName || "Jugador",
				targetPlayerId: activeTrial.targetPlayerId,
				word: activeTrial.word,
				category: activeTrial.category,
				originalStatus: activeTrial.originalStatus,
				challengerId: activeTrial.challengerId,
				initialVoteCount: activeTrial.votes.length,
				isRecovery: true,
			});
		}
	} catch (error) {
		socket.emit("error_joining", "Error al unirse a la sala");
	}
};

// Manejar cuando un usuario descarta los resultados (Click en "Volver a la sala")
export const handleDismissResults = async (io, socket, { roomId }) => {
	try {
		const user = socket.request.user;
		if (!user) return;

		const room = await roomService.updatePlayerInRoom(roomId, socket.id, {
			dismissedResults: true,
			ready: false, // Reset ready state when returning to lobby
		});

		if (room) {
			emitPlayerList(io, roomId, room.players);
		}
	} catch (error) {
		console.error("Error dismissing results", error);
	}
};

// Manejar la salida de la sala si el jugador sale de manera voluntaria - No tiene un emit principal
export const handleLeaveRoom = async (
	io,
	socket,
	{ room_id },
	checkRoundCompleteCallback,
) => {
	try {
		const user = socket.request.user;
		if (!user) {
			return;
		}

		const room = await roomService.removePlayerByEmail(room_id, user.email);

		if (room) {
			socket.leave(room_id);
			emitPlayerList(io, room_id, room.players);
			if (checkRoundCompleteCallback) await checkRoundCompleteCallback(room_id);
		} else {
			socket.leave(room_id);
		}
	} catch (err) {
		console.error("Error leaving room", err);
	}
};

// Manejar la desconexion del jugador - No tiene un emit principal
export const handleDisconnect = async (
	io,
	socket,
	checkRoundCompleteCallback,
) => {
	try {
		const result = await roomService.removePlayerBySocketId(socket.id);
		if (result) {
			const { roomId, room } = result;
			if (room && room.players.length > 0) {
				emitPlayerList(io, roomId, room.players);
				if (checkRoundCompleteCallback)
					await checkRoundCompleteCallback(roomId);
			}
		}
	} catch (err) {
		console.error("Error handling disconnect", err);
	}
};
