import logger from "./utils/logger.js";
import * as roomHandler from "./handlers/roomHandler.js";
import * as gameHandler from "./handlers/gameHandler.js";
import { verifyToken } from "./utils/jwtUtils.js";
import User from "./models/userModel.js";

// Maneja todos las recciones entre cliente y socket y lo deriva al socket correspondiente
const socketHandler = (io) => {
	io.use(async (socket, next) => {
		try {
			const token = socket.handshake.auth?.token;
			if (!token) return next(new Error("No token provided"));
			
			const decoded = verifyToken(token);
			if (!decoded) return next(new Error("Invalid token"));
			
			const user = await User.findById(decoded.id);
			if (!user) return next(new Error("User not found"));
			
			socket.request.user = user;
			next();
		} catch (err) {
			next(new Error("Authentication error"));
		}
	});

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
		// ToggleReady Final (Consensus for Podium)
		socket.on("toggle_ready_final", (roomId) => {
			gameHandler.handleFinalReady(io, socket, roomId);
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

		// Manejo de descartar resultados (Game Over)
		socket.on("dismiss_results", (data) => {
			roomHandler.handleDismissResults(io, socket, data);
		});

		socket.on("submit_answers", (data) => {
			gameHandler.handleSubmitAnswers(io, socket, data);
		});

		// Trial System Events
		socket.on("start_trial", (data) => {
			gameHandler.handleStartTrial(io, socket, data);
		});

		socket.on("vote_trial", (data) => {
			gameHandler.handleTrialVote(io, socket, data);
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
