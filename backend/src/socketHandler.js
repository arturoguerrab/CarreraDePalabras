import logger from "./utils/logger.js";
import * as roomHandler from "./handlers/roomHandler.js";
import * as gameHandler from "./handlers/gameHandler.js";

/**
 * SOCKET HANDLER
 * Manages all real-time communication events for the game by delegating to specific handlers.
 */
const socketHandler = (io) => {
  io.on("connection", (socket) => {
    // Security: Session Validation
    const sessionUser = socket.request.user;
    
    // Passport attaches the user object to req.user
    if (!sessionUser) {
      logger.warn(`🔒 Unauthorized connection attempt: ${socket.id}`);
      socket.disconnect();
      return;
    }

    logger.info(`🔌 New connection: ${socket.id} (User: ${sessionUser.email})`);

    /**
     * Creation & Joining
     */
    socket.on("create_room", () => {
      // User is now extracted from socket session in handler
      roomHandler.handleCreateRoom(io, socket);
    });

    socket.on("join_room", (data) => {
      roomHandler.handleJoinRoom(io, socket, data);
    });

    /**
     * Game Lifecycle
     */
    socket.on("toggle_ready", (roomId) => {
      gameHandler.handleToggleReady(io, socket, roomId);
    });

    socket.on("start_game", (data) => {
      gameHandler.handleStartGame(io, socket, data);
    });

    socket.on("next_round", (roomId) => {
      // Re-using toggle ready logic for next round as in original
      gameHandler.handleToggleReady(io, socket, roomId);
    });

    socket.on("reset_game", (roomId) => {
      gameHandler.handleResetGame(io, socket, roomId);
    });

    /**
     * Round Actions
     */
    socket.on("stop_round", (data) => {
      gameHandler.handleStopRound(io, socket, data);
    });

    socket.on("submit_answers", (data) => {
      gameHandler.handleSubmitAnswers(io, socket, data);
    });

    /**
     * Disconnection Handling
     */
    socket.on("leave_room", (data) => {
      // Pass checkRoundComplete as callback to verify if game should end/proceed when someone leaves
      roomHandler.handleLeaveRoom(io, socket, data, (roomId) => gameHandler.checkRoundComplete(io, roomId));
    });

    socket.on("disconnect", () => {
      roomHandler.handleDisconnect(io, socket, (roomId) => gameHandler.checkRoundComplete(io, roomId));
    });
  });
};

export default socketHandler;
