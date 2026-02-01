import { processRoundResults } from "../services/aiJudgeService.js";
import * as roomService from "../services/roomService.js";
import logger from "../utils/logger.js";
import { emitPlayerList } from "./roomHandler.js";

//Revision si todos los jugadores enviaron sus respuestas
export const checkRoundComplete = async (io, roomId) => {
  const room = roomService.getRoom(roomId);
  if (!room || room.isCalculating) return;

  if (
    room.isPlaying &&
    room.currentCategories?.length > 0 &&
    room.roundData.length >= room.players.length
  ) {
    await processRoundResults(io, roomId, room); //Llamado a la IA
  }
};

//Countdown de 60 segundos por ronda y count de 3s antes de empezar ronda
const startRoundWithCountdown = (io, roomId) => {
  const room = roomService.getRoom(roomId);
  if (!room) return;

  roomService.resetReadiness(roomId);
  io.to(roomId).emit("start_countdown", 3); //Game context

  setTimeout(async () => {
    const roomData = roomService.prepareNextRound(roomId);
    if (!roomData) return;

    // Limpieza de posible tiempo restante
    if (room.timer) clearTimeout(room.timer);

    // Inicio de los 60s de partida
    const TIME_LIMIT = 60;
    room.timer = setTimeout(() => {
      logger.info(`Time's up for room ${roomId}`);

      room.stoppedBy = "EL JUEZ";
      io.to(roomId).emit("force_submit", { stoppedBy: room.stoppedBy });

      setTimeout(() => checkRoundComplete(io, roomId), 2000);
    }, TIME_LIMIT * 1000);

    emitPlayerList(io, roomId, room.players);
    io.to(roomId).emit("game_started", {
      letter: roomData.letter,
      categories: roomData.categories,
      roundDuration: TIME_LIMIT,
    });
  }, 3000);
};

export const handleToggleReady = (io, socket, roomId) => {
  const room = roomService.getRoom(roomId);
  if (!room) return;

  logger.info(`Player ${socket.id} toggled ready in room ${roomId}`);
  roomService.togglePlayerReady(roomId, socket.id);
  emitPlayerList(io, roomId, room.players);

  // Revisar si todos estan listos
  const allReady =
    room.players.length > 0 && room.players.every((p) => p.ready);

  if (allReady) {
    logger.info(`All players ready in room ${roomId}. Starting...`);
    if (!room.isPlaying) {
      room.isPlaying = true;
      room.scores = {};
      room.usedLetters = [];
      room.config.currentRound = 1;
    }
    startRoundWithCountdown(io, roomId);
  }
};

export const handleStartGame = (socket, data) => {
  try {
    logger.info(`Start Game requested via socket ${socket.id}`, data);
    const roomId = typeof data === "object" ? data.room_id : data;
    const room = roomService.getRoom(roomId);

    if (room) {
      if (typeof data === "object" && data.rounds) {
        const rounds = Number(data.rounds);
        if (!isNaN(rounds)) {
          room.config.totalRounds = rounds;
          logger.info(`Room ${roomId} rounds set to ${rounds}`);
        }
      }

      logger.info(`Room ${roomId} configured. Waiting for toggle_ready...`);
    } else {
      logger.error(`Room ${roomId} not found for start_game`);
    }
  } catch (err) {
    logger.error("Error in start_game handler:", err);
  }
};

export const handleResetGame = (io, roomId) => {
  const room = roomService.getRoom(roomId);
  if (room) {
    if (room.timer) clearTimeout(room.timer);
    room.isPlaying = false;
    room.scores = {};
    room.roundData = [];
    room.usedLetters = [];
    room.config.currentRound = 1;
    roomService.resetReadiness(roomId);
    io.to(roomId).emit("game_reset");
    emitPlayerList(io, roomId, room.players);
  }
};

export const handleStopRound = (io, socket, { roomId, answers }) => {
  const room = roomService.getRoom(roomId);
  if (!room) return socket.emit("error_joining", "La sala ha expirado.");

  if (room.roundData.find((d) => d.playerId === socket.id)) return;

  if (room.timer) clearTimeout(room.timer);

  // Quien realizo el STOP
  const stopper = room.players.find((p) => p.id === socket.id);
  const stopperName = stopper
    ? stopper.username || stopper.firstName || stopper.email
    : "Alguien";

  room.roundData.push({ playerId: socket.id, answers });

  socket.to(roomId).emit("force_submit", { stoppedBy: stopperName });

  room.stoppedBy = stopperName;

  checkRoundComplete(io, roomId);
};

export const handleSubmitAnswers = (io, socket, { roomId, answers }) => {
  const room = roomService.getRoom(roomId);
  if (room && !room.roundData.find((d) => d.playerId === socket.id)) {
    room.roundData.push({ playerId: socket.id, answers });
    checkRoundComplete(io, roomId);
  }
};
