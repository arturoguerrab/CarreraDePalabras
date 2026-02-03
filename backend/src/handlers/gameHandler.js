import { processRoundResults } from "../services/aiJudgeService.js";
import * as roomService from "../services/roomService.js";
import * as gameService from "../services/gameService.js";
import logger from "../utils/logger.js";
import { emitPlayerList } from "./roomHandler.js";
import { fetchRoomOrError } from "../utils/socketUtils.js";

// Verificar si la ronda está completa
export const checkRoundComplete = async (io, roomId) => {
	try {
		const room = await roomService.getRoom(roomId);
		if (!room || room.isCalculating) return;

		if (
			room.isPlaying &&
			room.currentCategories?.length > 0 &&
			room.roundData.length >= room.players.length
		) {
			room.isCalculating = true;
			await room.save();

			await processRoundResults(io, roomId, room);
		}
	} catch (err) {
		logger.error("Error in checkRoundComplete", err);
	}
};

// Logica para iniciar la ronda - emit principal 'game_started' y 'start_countdown'
const startRoundWithCountdown = async (io, roomId) => {
	await roomService.resetReadiness(roomId);
	io.to(roomId).emit("start_countdown", 3);

	setTimeout(async () => {
		try {
			const roomData = await gameService.prepareNextRound(roomId);
			if (!roomData) return;

			const room = await roomService.getRoom(roomId);
			const TIME_LIMIT = 60;

			await startTimer(io, roomId, TIME_LIMIT);

			emitPlayerList(io, roomId, room.players);
			io.to(roomId).emit("game_started", {
				letter: roomData.letter,
				categories: roomData.categories,
				roundDuration: TIME_LIMIT,
			});
		} catch (err) {
			logger.error("Error starting round", err);
		}
	}, 3000);
};

const activeTimers = new Map();

// Logica para iniciar el timer - emit principal 'force_submit'
const startTimer = async (io, roomId, durationSeconds) => {
	if (activeTimers.has(roomId)) {
		clearTimeout(activeTimers.get(roomId));
	}

	// Guardar tiempo de inicio en DB para recuperación
	try {
		await roomService.setRoomTimer(roomId, new Date());
	} catch (err) {
		logger.error(`Error saving timer for room ${roomId}`, err);
	}

	const timer = setTimeout(async () => {
		logger.info(`Time's up for room ${roomId}`);

		const room = await roomService.getRoom(roomId);
		if (room) {
			room.stoppedBy = "EL JUEZ";
			room.timerStart = null; // Limpiar timer
			await room.save();

			io.to(roomId).emit("force_submit", { stoppedBy: "EL JUEZ" });

			setTimeout(() => checkRoundComplete(io, roomId), 2000);
		}
		activeTimers.delete(roomId);
	}, durationSeconds * 1000);

	activeTimers.set(roomId, timer);
};

// Logica para limpiar el timer
const clearRoomTimer = async (roomId) => {
	if (activeTimers.has(roomId)) {
		clearTimeout(activeTimers.get(roomId));
		activeTimers.delete(roomId);
	}
	try {
		await roomService.setRoomTimer(roomId, null);
	} catch (err) {
		logger.warn(`Failed to clear timer for room ${roomId}`, err);
	}
};

// Logica para manejar el toggle de ready
export const handleToggleReady = async (io, socket, roomId) => {
	try {
		const room = await roomService.togglePlayerReady(roomId, socket.id);
		if (!room) return;

		logger.info(
			`Player ${socket.id} toggled ready in room ${roomId}. Players: ${JSON.stringify(
				room.players.map((p) => ({ id: p.id, email: p.email, ready: p.ready })),
			)}`,
		);
		emitPlayerList(io, roomId, room.players);

		const allReady =
			room.players.length > 0 && room.players.every((p) => p.ready);

		if (allReady) {
			logger.info(`All players ready in room ${roomId}. Starting...`);
			if (!room.isPlaying) {
				// Init Game State
				room.isPlaying = true;
				room.scores = {};
				room.usedLetters = [];
				room.config.currentRound = 1;
				await room.save();
			}
			await startRoundWithCountdown(io, roomId);
		} else {
			logger.info(
				`Room ${roomId} waiting for players. Ready: ${
					room.players.filter((p) => p.ready).length
				}/${room.players.length}`,
			);
		}
	} catch (err) {
		logger.error("Error toggle ready", err);
	}
};

// Logica para manejar el start game
export const handleStartGame = async (socket, data) => {
	try {
		logger.info(`Start Game requested via socket ${socket.id}`, data);
		const roomId = typeof data === "object" ? data.room_id : data;
		const room = await fetchRoomOrError(socket, roomId);
		if (!room) return;

		if (typeof data === "object" && data.rounds) {
			const rounds = Number(data.rounds);
			if (!isNaN(rounds)) {
				room.config.totalRounds = rounds;
				await room.save();
				logger.info(`Room ${roomId} rounds set to ${rounds}`);
			}
		}
		logger.info(`Room ${roomId} configured. Waiting for toggle_ready...`);
	} catch (err) {
		logger.error("Error in start_game handler:", err);
	}
};

// Logica para manejar el reset game - emit principal 'game_reset'
export const handleResetGame = async (io, roomId) => {
	try {
		await clearRoomTimer(roomId);
		const room = await gameService.resetGame(roomId);
		if (room) {
			emitPlayerList(io, roomId, room.players);
			io.to(roomId).emit("game_reset");
		}
	} catch (err) {
		logger.error("Reset Game Error", err);
	}
};

// Logica para manejar el stop round - emit principal 'force_submit'
export const handleStopRound = async (io, socket, { roomId, answers }) => {
	try {
		const room = await fetchRoomOrError(socket, roomId);
		if (!room) return;

		if (room.roundData.find((d) => d.playerId === socket.id)) return;

		await clearRoomTimer(roomId);

		const stopper = room.players.find((p) => p.id === socket.id);
		const stopperName = stopper
			? stopper.username || stopper.firstName || stopper.email
			: "Alguien";

		room.roundData.push({ playerId: socket.id, answers });
		room.stoppedBy = stopperName;
		await room.save();

		socket.to(roomId).emit("force_submit", { stoppedBy: stopperName });

		await checkRoundComplete(io, roomId);
	} catch (err) {
		logger.error("Stop Round Error", err);
	}
};

// Logica para manejar el submit answers
export const handleSubmitAnswers = async (io, socket, { roomId, answers }) => {
	try {
		const room = await fetchRoomOrError(socket, roomId);
		if (!room) return;

		if (!room.roundData.find((d) => d.playerId === socket.id)) {
			room.roundData.push({ playerId: socket.id, answers });
			await room.save();
			await checkRoundComplete(io, roomId);
		}
	} catch (err) {
		logger.error("Submit Answers Error", err);
	}
};
