import { processRoundResults } from "../services/aiJudgeService.js";
import * as roomService from "../services/roomService.js";
import logger from "../utils/logger.js";
import { emitPlayerList } from "./roomHandler.js";

/**
 * Helper: Checks if all players submitted their answers.
 */
export const checkRoundComplete = async (io, roomId) => {
  const room = roomService.getRoom(roomId);
  if (!room || room.isCalculating) return;

  if (room.isPlaying && room.currentCategories?.length > 0 && room.roundData.length >= room.players.length) {
    await processRoundResults(io, roomId, room);
  }
};

/**
 * Helper: Start a round with a countdown.
 */
const startRoundWithCountdown = (io, roomId) => {
    const room = roomService.getRoom(roomId);
    if (!room) return;

    roomService.resetReadiness(roomId); // Reset ready status when round starts
    io.to(roomId).emit("start_countdown", 3);

    setTimeout(async () => {
      const roomData = roomService.prepareNextRound(roomId);
      if (!roomData) return;

      // Clear any existing timer just in case
      if (room.timer) clearTimeout(room.timer);

      // Start the 60s Auto-Stop Timer
      const TIME_LIMIT = 60; // seconds
      room.timer = setTimeout(() => {
        logger.info(`⏰ Time's up for room ${roomId}`);
        
        // Logic similar to stop_round but triggered by system
        room.stoppedBy = "⏰ EL TIEMPO ⏰";
        io.to(roomId).emit("force_submit", { stoppedBy: room.stoppedBy });
        
        // Allow a slight buffer for clients to submit
        setTimeout(() => checkRoundComplete(io, roomId), 2000); 
      }, TIME_LIMIT * 1000);

      emitPlayerList(io, roomId, room.players); // Notify reset ONCE the round starts
      io.to(roomId).emit("game_started", {
        letter: roomData.letter,
        categories: roomData.categories,
        roundDuration: TIME_LIMIT
      });
    }, 3000);
};

export const handleToggleReady = (io, socket, roomId) => {
    const room = roomService.getRoom(roomId);
    if (!room) return;

    logger.info(`🙋 Player ${socket.id} toggled ready in room ${roomId}`);
    roomService.togglePlayerReady(roomId, socket.id);
    emitPlayerList(io, roomId, room.players);

    // Check if all are ready to proceed
    const allReady = room.players.length > 0 && room.players.every(p => p.ready);
    
    if (allReady) {
      logger.info(`✅ All players ready in room ${roomId}. Starting...`);
      if (!room.isPlaying) {
        room.isPlaying = true;
        room.scores = {};
        room.usedLetters = [];
        room.config.currentRound = 1;
      }
      startRoundWithCountdown(io, roomId);
    }
};

export const handleStartGame = (io, socket, data) => {
    try {
        logger.info(`🎮 Start Game requested via socket ${socket.id}`, data);
        const roomId = typeof data === 'object' ? data.room_id : data;
        const room = roomService.getRoom(roomId);
        
        if (room) {
           if (typeof data === 'object' && data.rounds) {
              const r = Number(data.rounds);
              if (!isNaN(r)) {
                 room.config.totalRounds = r;
                 logger.info(`✅ Room ${roomId} rounds set to ${r}`);
              }
           }
           // Decoupled logic: start_game ONLY sets configuration.
           // The frontend must call toggle_ready explicitly afterwards.
           logger.info(`✅ Room ${roomId} configured. Waiting for toggle_ready...`);
        } else {
           logger.error(`❌ Room ${roomId} not found for start_game`);
        }
      } catch (err) {
        logger.error("❌ Error in start_game handler:", err);
      }
};

export const handleResetGame = (io, socket, roomId) => {
    const room = roomService.getRoom(roomId);
    if (room) {
        if (room.timer) clearTimeout(room.timer); // Clear timer on reset
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
    
    if (room.roundData.find(d => d.playerId === socket.id)) return;

    // Clear the auto-stop timer since a player stopped it manually
    if (room.timer) clearTimeout(room.timer);

    // Find the player who pressed STOP
    const stopper = room.players.find(p => p.id === socket.id);
    const stopperName = stopper ? (stopper.username || stopper.firstName || stopper.email) : "Alguien";

    room.roundData.push({ playerId: socket.id, answers });
    
    // Broadcast who pressed STOP to all other players
    socket.to(roomId).emit("force_submit", { stoppedBy: stopperName });
    
    // Store stopper info for results
    room.stoppedBy = stopperName;
    
    checkRoundComplete(io, roomId);
};

export const handleSubmitAnswers = (io, socket, { roomId, answers }) => {
    const room = roomService.getRoom(roomId);
    if (room && !room.roundData.find(d => d.playerId === socket.id)) {
        room.roundData.push({ playerId: socket.id, answers });
        checkRoundComplete(io, roomId);
    }
};
