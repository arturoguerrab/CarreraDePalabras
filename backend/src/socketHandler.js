import { processRoundResults } from "./services/aiJudgeService.js";
import * as roomService from "./services/roomService.js";

/**
 * SOCKET HANDLER
 * Manages all real-time communication events for the game.
 */
const socketHandler = (io) => {
  
  /**
   * Helper: Start a round with a countdown.
   */
  const startRoundWithCountdown = (roomId) => {
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
        console.log(`⏰ Time's up for room ${roomId}`);
        
        // Logic similar to stop_round but triggered by system
        room.stoppedBy = "⏰ EL TIEMPO ⏰";
        io.to(roomId).emit("force_submit", { stoppedBy: room.stoppedBy });
        
        // Allow a slight buffer for clients to submit
        setTimeout(() => checkRoundComplete(roomId), 2000); 
      }, TIME_LIMIT * 1000);

      emitPlayerList(roomId, room.players); // Notify reset ONCE the round starts
      io.to(roomId).emit("game_started", {
        letter: roomData.letter,
        categories: roomData.categories,
        roundDuration: TIME_LIMIT
      });
    }, 3000);
  };

  /**
   * Helper: Emit updated player list to a room.
   */
  const emitPlayerList = (roomId, players) => {
    io.to(roomId).emit("update_player_list", players.map(p => ({
      email: p.email,
      displayName: p.username || p.firstName || p.email,
      ready: p.ready
    })));
  };

  /**
   * Helper: Checks if all players submitted their answers.
   */
  const checkRoundComplete = async (roomId) => {
    const room = roomService.getRoom(roomId);
    if (!room || room.isCalculating) return;

    if (room.isPlaying && room.currentCategories?.length > 0 && room.roundData.length >= room.players.length) {
      await processRoundResults(io, roomId, room);
    }
  };

  /**
   * Helper: Handles the logic for toggling a player's ready status
   * and checking if the game/round should start.
   */
  const handleToggleReady = (socket, roomId) => {
    const room = roomService.getRoom(roomId);
    if (!room) return;

    console.log(`🙋 Player ${socket.id} toggled ready in room ${roomId}`);
    roomService.togglePlayerReady(roomId, socket.id);
    emitPlayerList(roomId, room.players);

    // Check if all are ready to proceed
    const allReady = room.players.length > 0 && room.players.every(p => p.ready);
    
    if (allReady) {
      console.log(`✅ All players ready in room ${roomId}. Starting...`);
      if (!room.isPlaying) {
        room.isPlaying = true;
        room.scores = {};
        room.usedLetters = [];
        room.config.currentRound = 1;
      }
      startRoundWithCountdown(roomId);
    }
  };

  io.on("connection", (socket) => {
    console.log(`🔌 New connection: ${socket.id}`);

    /**
     * Creation & Joining
     */
    socket.on("create_room", (user) => {
      const roomId = roomService.createRoom(user, socket.id);
      socket.join(roomId);
      const room = roomService.getRoom(roomId);

      emitPlayerList(roomId, room.players);
      socket.emit("room_created", roomId);
    });

    socket.on("join_room", ({ room_id, user }) => {
      const result = roomService.joinRoom(room_id, user, socket.id);
      if (result.error) {
        return socket.emit("error_joining", result.error);
      }

      socket.join(room_id);
      socket.emit("joined_room", room_id);
      emitPlayerList(room_id, result.room.players);
    });

    /**
     * Game Lifecycle
     */
    socket.on("toggle_ready", (roomId) => {
      handleToggleReady(socket, roomId);
    });

    socket.on("start_game", (data) => {
      try {
        console.log(`🎮 Start Game requested via socket ${socket.id}`, data);
        const roomId = typeof data === 'object' ? data.room_id : data;
        const room = roomService.getRoom(roomId);
        
        if (room) {
           if (typeof data === 'object' && data.rounds) {
              const r = Number(data.rounds);
              if (!isNaN(r)) {
                 room.config.totalRounds = r;
                 console.log(`✅ Room ${roomId} rounds set to ${r}`);
              }
           }
           // Decoupled logic: start_game ONLY sets configuration.
           // The frontend must call toggle_ready explicitly afterwards.
           console.log(`✅ Room ${roomId} configured. Waiting for toggle_ready...`);
        } else {
           console.error(`❌ Room ${roomId} not found for start_game`);
        }
      } catch (err) {
        console.error("❌ Error in start_game handler:", err);
      }
    });

    socket.on("next_round", (roomId) => {
      handleToggleReady(socket, roomId);
    });

    socket.on("reset_game", (roomId) => {
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
        emitPlayerList(roomId, room.players);
      }
    });

    /**
     * Round Actions
     */
    socket.on("stop_round", ({ roomId, answers }) => {
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
      
      checkRoundComplete(roomId);
    });

    socket.on("submit_answers", ({ roomId, answers }) => {
      const room = roomService.getRoom(roomId);
      if (room && !room.roundData.find(d => d.playerId === socket.id)) {
        room.roundData.push({ playerId: socket.id, answers });
        checkRoundComplete(roomId);
      }
    });

    /**
     * Disconnection Handling
     */
    socket.on("leave_room", ({ room_id, user }) => {
      const room = roomService.removePlayer(room_id, socket.id);
      if (room) {
        socket.leave(room_id);
        emitPlayerList(room_id, room.players);
        checkRoundComplete(room_id);
      }
    });

    socket.on("disconnect", () => {
      const result = roomService.removePlayerBySocketId(socket.id);
      if (result) {
        const { roomId, room } = result;
        emitPlayerList(roomId, room.players);
        checkRoundComplete(roomId);
      }
    });
  });
};

export default socketHandler;
