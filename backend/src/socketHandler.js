import logger from "./utils/logger.js";
import * as roomHandler from "./handlers/roomHandler.js";
import * as gameHandler from "./handlers/gameHandler.js";

// Maneja todos las recciones entre cliente y socket y lo deriva al socket correspondiente
const socketHandler = (io) => {
  io.on("connection", (socket) => {
    // Valida la sesion
    const sessionUser = socket.request.user;

    if (!sessionUser) {
      logger.warn(`Unauthorized connection attempt: ${socket.id}`);
      socket.disconnect();
      return;
    }

    logger.info(`New connection: ${socket.id} (User: ${sessionUser.email})`);

    // createRoom - Game Context
    socket.on("create_room", () => {
      roomHandler.handleCreateRoom(io, socket);
    });
    //joinRoom - Game Context
    socket.on("join_room", (data) => {
      roomHandler.handleJoinRoom(io, socket, data);
    });
    // ToggleReady - Game Context
    socket.on("toggle_ready", (roomId) => {
      gameHandler.handleToggleReady(io, socket, roomId);
    });
    // startGame - Game Context
    socket.on("start_game", (data) => {
      gameHandler.handleStartGame(socket, data);
    });
    // nextRound - Game Context
    socket.on("next_round", (roomId) => {
      gameHandler.handleToggleReady(io, socket, roomId);
    });
    // resetGame - Game Context
    socket.on("reset_game", (roomId) => {
      gameHandler.handleResetGame(io, roomId);
    });

    socket.on("stop_round", (data) => {
      gameHandler.handleStopRound(io, socket, data);
    });

    socket.on("submit_answers", (data) => {
      gameHandler.handleSubmitAnswers(io, socket, data);
    });
    // LeaveRoom - Game Context
    socket.on("leave_room", (data) => {
      roomHandler.handleLeaveRoom(io, socket, data, (roomId) =>
        gameHandler.checkRoundComplete(io, roomId),
      );
    });

    socket.on("disconnect", () => {
      roomHandler.handleDisconnect(io, socket, (roomId) =>
        gameHandler.checkRoundComplete(io, roomId),
      );
    });
  });
};

export default socketHandler;
