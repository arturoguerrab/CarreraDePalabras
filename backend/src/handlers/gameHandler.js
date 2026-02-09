import { processRoundResults } from "../services/aiJudgeService.js";
import * as roomService from "../services/roomService.js";
import * as gameService from "../services/gameService.js";
import logger from "../utils/logger.js";
import { emitPlayerList } from "./roomHandler.js";
import { fetchRoomOrError } from "../utils/socketUtils.js";
import Trial from "../models/trialModel.js";

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
			const lockedRoom = await roomService.acquireCalculationLock(roomId);
			if (lockedRoom) {
				await processRoundResults(io, roomId, lockedRoom);
			}
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
				// STARTING NEW GAME (LOBBY -> GAME)
				// Init Game State
				room.isPlaying = true;
				room.scores = {};
				room.usedLetters = [];
				room.config.currentRound = 1;
				await room.save();
			} else {
				// CONTINUING EXISTING GAME
				// Check if Game Over (Don't start new round, just let frontend show podium)
				if (room.config.currentRound > room.config.totalRounds) {
					logger.info(`Room ${roomId}: Game Over, not starting new round.`);
					return;
				}
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

// Logica para manejar el toggle ready FINAL (Solo para ir al podio, NUNCA inicia ronda)
export const handleFinalReady = async (io, socket, roomId) => {
	try {
		// 1. Alternar estado del jugador actual
		const room = await roomService.togglePlayerReady(roomId, socket.id);
		if (!room) return;

		logger.info(`Player ${socket.id} toggled FINAL ready in room ${roomId}.`);

		// 2. Verificar si TODOS están listos para el podio
		const allReady =
			room.players.length > 0 && room.players.every((p) => p.ready);

		if (allReady) {
			logger.info(
				`Consensus reached for podium in room ${roomId}. Cleaning room...`,
			);

			// LIMPIEZA ATÓMICA: Reseteamos todo para todos antes de pasar al podio
			const updatedRoom = await roomService.resetRoomForLobby(roomId);

			if (updatedRoom) {
				// A) Notificar transicion al Podio
				io.to(roomId).emit("final_consensus_reached");

				// B) Emitir lista LIMPIA (importante para cuando vuelvan al Lobby)
				emitPlayerList(io, roomId, updatedRoom.players);
			}
		} else {
			// Aún faltan jugadores, actualizar lista con los checks normales
			emitPlayerList(io, roomId, room.players);
		}
	} catch (err) {
		logger.error("Error toggle final ready", err);
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

// --- TRIAL SYSTEM LOGIC ---

// Start a Trial
export const handleStartTrial = async (io, socket, data) => {
	try {
		const { roomId, targetPlayerId, category, letter, word, originalStatus } =
			data;
		const room = await fetchRoomOrError(socket, roomId);
		if (!room) return;

		const challenger = room.players.find((p) => p.id === socket.id);
		if (!challenger) return;

		// 1. Validate Token
		if (challenger.judgmentTokens < 1) {
			socket.emit("error", {
				message: "No tienes fichas de juicio disponibles.",
			});
			return;
		}

		// 2. Create Trial Record
		// AUTOMATIC VOTE LOGIC:
		// If originalStatus == 'valid' (Attack) -> Challenger votes 'invalid'
		// If originalStatus == 'invalid' (Appeal) -> Challenger votes 'valid'
		const challengerVote = originalStatus === "valid" ? "invalid" : "valid";

		const newTrial = await Trial.create({
			roomId,
			roundNumber: room.config.currentRound,
			challengerId: socket.id,
			challengerEmail: challenger.email,
			targetPlayerId,
			category,
			letter: letter || room.currentLetter,
			word,
			originalStatus,
			status: "pending",
			votes: [{ playerId: socket.id, vote: challengerVote }],
		});

		// 3. Notify all players
		io.to(roomId).emit("trial_started", {
			trialId: newTrial._id,
			challengerName: challenger.username || challenger.firstName || "Jugador",
			targetPlayerId,
			word,
			category,
			originalStatus,
			challengerId: socket.id, // Ensure frontend knows who challenged
			initialVoteCount: 1, // Notify that a vote is already cast
		});

		logger.info(
			`Trial started in room ${roomId} by ${socket.id} for word '${word}'`,
		);
	} catch (err) {
		logger.error("Error starting trial:", err);
	}
};

// Handle a Vote
export const handleTrialVote = async (io, socket, data) => {
	try {
		const { roomId, trialId, vote } = data; // vote: 'valid' | 'invalid'
		const room = await fetchRoomOrError(socket, roomId);
		if (!room) return;

		const trial = await Trial.findById(trialId);
		if (!trial || trial.status !== "pending") return;

		// Record Vote (prevent double voting)
		const existingVote = trial.votes.find((v) => v.playerId === socket.id);
		if (existingVote) {
			existingVote.vote = vote;
		} else {
			trial.votes.push({ playerId: socket.id, vote });
		}
		await trial.save();

		// Notify progress
		io.to(roomId).emit("vote_update", {
			voteCount: trial.votes.length,
			totalPlayers: room.players.length,
		});

		// Check if ALL players have voted
		// Note: We might want to exclude the target or challenger from voting?
		// Plan says: "Player A and B (and others) vote." so everyone votes.
		if (trial.votes.length >= room.players.length) {
			await resolveTrial(io, roomId, trial, room);
		}
	} catch (err) {
		logger.error("Error handling trial vote:", err);
	}
};

// Helper: Resolve Trial
const resolveTrial = async (io, roomId, trial, room) => {
	try {
		// Count votes
		let validVotes = 0;
		let invalidVotes = 0;

		trial.votes.forEach((v) => {
			if (v.vote === "valid") validVotes++;
			else if (v.vote === "invalid") invalidVotes++;
		});

		// Determine Verdict
		let verdict = "tie";
		let winnerId = null;
		// Logic:
		// If Valid > Invalid -> Verdict: valid
		// If Invalid > Valid -> Verdict: invalid
		// Else -> tie

		if (validVotes > invalidVotes) verdict = "valid";
		else if (invalidVotes > validVotes) verdict = "invalid";

		// Did the Challenger win?
		// Challenger wins if verdict DIFFERENT from originalStatus
		// E.g. Original: "invalid" (AI rejected). Verdict: "valid". Challenger Win.
		// E.g. Original: "valid" (AI accepted). Verdict: "invalid". Challenger Win.
		const challengerWon = verdict !== "tie" && verdict !== trial.originalStatus;

		// Update Token
		const challenger = room.players.find((p) => p.id === trial.challengerId);
		let tokenUpdate = "kept"; // kept | lost

		if (challenger) {
			if (challengerWon) {
				// Keep token (do nothing, or ensure it's same)
				tokenUpdate = "kept";
			} else {
				// Lose token (even if tie)
				challenger.judgmentTokens = Math.max(0, challenger.judgmentTokens - 1);
				await room.save();
				tokenUpdate = "lost";
			}
		}

		// Update Word Status if Challenger Won
		let updatedWordStatus = trial.originalStatus;
		if (challengerWon) {
			updatedWordStatus = verdict;

			// PERMANENT UPDATE LOGIC
			if (room.lastRoundResults && Array.isArray(room.lastRoundResults)) {
				// 1. Find Category
				const catBlock = room.lastRoundResults.find(
					(c) => c.categoria === trial.category,
				);
				if (catBlock) {
					// 2. Update Status for ALL players with this word (Fairness)
					// Verify normalize is available or define it here
					const normalize = (str) =>
						str
							? str
									.normalize("NFD")
									.replace(/[\u0300-\u036f]/g, "")
									.toLowerCase()
									.trim()
							: "";
					const trialWordNorm = normalize(trial.word);

					catBlock.respuestas.forEach((r) => {
						if (normalize(r.palabra) === trialWordNorm) {
							r.es_valida = verdict === "valid";
							r.mensaje =
								verdict === "valid"
									? "Validada por Juicio"
									: "Invalidada por Juicio";

							// FORCE SCORE MODIFIER TO 1 IF VALIDATED
							if (r.es_valida) {
								r.scoreModifier = 1;
							}
						}
					});

					// 3. Recalculate Scoring for this Category
					// Count valid word frequencies
					const wordCounts = {};
					catBlock.respuestas.forEach((r) => {
						if (r.es_valida) {
							const w = normalize(r.palabra);
							wordCounts[w] = (wordCounts[w] || 0) + 1;
						}
					});

					// Re-assign points based on frequencies
					catBlock.respuestas.forEach((r) => {
						if (r.es_valida) {
							const w = normalize(r.palabra);
							const isRepeated = wordCounts[w] > 1;
							const mod = r.scoreModifier !== undefined ? r.scoreModifier : 1;
							r.puntos = (isRepeated ? 50 : 100) * mod;
						} else {
							r.puntos = 0;
						}
					});

					// 4. Update Total Room Scores
					// Reset scores
					const newScores = {};
					room.lastRoundResults.forEach((cat) => {
						cat.respuestas.forEach((r) => {
							newScores[r.nombre] = (newScores[r.nombre] || 0) + r.puntos;
						});
					});

					room.scores = newScores;
					room.markModified("lastRoundResults");
					room.markModified("scores");
					await room.save();
				}
			}
		}

		// Finalize Trial Record
		trial.status = "resolved";
		trial.verdict = verdict;
		trial.winnerId = challengerWon ? trial.challengerId : null;
		await trial.save();

		// Notify everyone
		io.to(roomId).emit("trial_resolved", {
			trialId: trial._id,
			verdict,
			challengerWon,
			tokenUpdate,
			updatedWordStatus,
			targetPlayerId: trial.targetPlayerId,
			word: trial.word,
			category: trial.category,
			challengerId: trial.challengerId,
		});

		// Emit updated player list (tokens changed)
		// Need to import emitPlayerList if not available in scope, but it is imported at top of file
		emitPlayerList(io, roomId, room.players);

		logger.info(`Trial resolved: ${verdict}. Challenger won: ${challengerWon}`);
	} catch (err) {
		logger.error("Error resolving trial:", err);
	}
};
