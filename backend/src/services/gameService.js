import { ALL_CATEGORIES } from "../config/gameConstants.js";
import * as roomService from "./roomService.js";

const ALPHABET_ARRAY = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Obtener categorias barajadas
const getShuffledCategories = (count = 5) => {
	return [...ALL_CATEGORIES].sort(() => 0.5 - Math.random()).slice(0, count);
};

// Preparar la siguiente ronda
export const prepareNextRound = async (roomId) => {
	const room = await roomService.getRoom(roomId);
	if (!room) return null;

	// Filtro para no usar letras ya usadas
	const availableLetters = ALPHABET_ARRAY.filter(
		(l) => !room.usedLetters.includes(l),
	);

	// Si nos quedamos sin letras, reiniciamos el pool
	const pool = availableLetters.length > 0 ? availableLetters : ALPHABET_ARRAY;
	const randomLetter = pool[Math.floor(Math.random() * pool.length)];

	const categories = getShuffledCategories(8);

	// Update DB
	room.usedLetters.push(randomLetter);
	room.currentLetter = randomLetter;
	room.currentCategories = categories;
	room.roundData = [];
	room.stoppedBy = null;
	room.isCalculating = false;

	await room.save();

	return {
		letter: randomLetter,
		categories: categories,
	};
};

// Reiniciar el juego
export const resetGame = async (roomId) => {
	const room = await roomService.getRoom(roomId);
	if (!room) return null;

	room.isPlaying = false;
	room.isCalculating = false;
	room.scores = {};
	room.roundData = [];
	room.usedLetters = [];
	room.lastRoundResults = null; // Limpiar historial
	room.config.currentRound = 1;
	room.players.forEach((p) => {
		p.ready = false;
		p.dismissedResults = false;
	});

	await room.save();
	return room;
};

// Finalizar la ronda
export const finalizeRound = async (roomId) => {
	const room = await roomService.getRoom(roomId);
	if (!room) return;

	// contador de rondas
	if (room.config.currentRound < room.config.totalRounds) {
		room.config.currentRound += 1;
		await room.save();
		return { isGameOver: false, currentRound: room.config.currentRound };
	} else {
		// Fin del juego
		room.isPlaying = false;
		await room.save();
		return { isGameOver: true };
	}
};
