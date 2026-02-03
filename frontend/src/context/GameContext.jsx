import {
	createContext,
	useState,
	useEffect,
	useCallback,
	useContext,
} from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";
import { useRoom } from "./RoomContext";

export const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameContextProvider = ({ children }) => {
	const { socket } = useSocket();
	const { user } = useAuth();
	const { roomId } = useRoom();

	// Estados del Juego
	const [gameError, setGameError] = useState(null);
	const [gameState, setGameState] = useState("lobby"); // 'lobby', 'playing', 'calculating', 'results'
	const [gameLetter, setGameLetter] = useState("");
	const [gameCategories, setGameCategories] = useState([]);
	const [gameResults, setGameResults] = useState([]);
	const [gameScores, setGameScores] = useState({});
	const [isGameOver, setIsGameOver] = useState(false);
	const [roundInfo, setRoundInfo] = useState({ current: 0, total: 0 });
	const [countdown, setCountdown] = useState(null);
	const [stoppedBy, setStoppedBy] = useState(null);
	const [roundDuration, setRoundDuration] = useState(60);

	// Limpia el estado del juego
	const clearGameData = useCallback(() => {
		setGameError(null);
		setGameResults([]);
		setGameScores({});
		setIsGameOver(false);
		setRoundInfo({ current: 0, total: 0 });
		setCountdown(null);
		setStoppedBy(null);
	}, []);

	// Sincroniza el estado del juego con la sala (si la sala es null, reinicia)
	useEffect(() => {
		if (!roomId) {
			setGameState("lobby");
			clearGameData();
		}
	}, [roomId, clearGameData]);

	// Lógica de Eventos de Juego
	useEffect(() => {
		if (!socket) return;

		//Cuenta atras para empezar la ronda
		const onCountdown = (seconds) => {
			setCountdown(seconds);
			setGameError(null);
			setStoppedBy(null);
		};

		// Set inicial de una partida
		const onGameStarted = ({ letter, categories, roundDuration: duration }) => {
			setCountdown(null);
			setGameLetter(letter);
			setGameCategories(categories || []);
			setGameState("playing");
			setStoppedBy(null);
			if (duration) setRoundDuration(duration);
		};

		// Resultados de ronda
		const onRoundResults = (data) => {
			if (data.results) {
				setGameResults(data.results);
				setGameScores(data.scores);
				setIsGameOver(data.isGameOver);
				setRoundInfo({ current: data.round, total: data.totalRounds });
				setStoppedBy(data.stoppedBy || null);
			} else {
				setGameResults(data);
			}
			setGameState("results");
		};

		const onCalculating = () => setGameState("calculating");

		const onForceSubmit = (data) => {
			if (data && data.stoppedBy) {
				setStoppedBy(data.stoppedBy);
			}
		};

		// Listeners solo de JUEGO
		socket.on("start_countdown", onCountdown);
		socket.on("game_started", onGameStarted);
		socket.on("round_results", onRoundResults);
		socket.on("calculating_results", onCalculating);
		socket.on("force_submit", onForceSubmit);
		socket.on("game_reset", () => {
			setGameState("lobby");
			clearGameData();
		});

		return () => {
			socket.off("start_countdown", onCountdown);
			socket.off("game_started", onGameStarted);
			socket.off("round_results", onRoundResults);
			socket.off("calculating_results", onCalculating);
			socket.off("force_submit", onForceSubmit);
			socket.off("game_reset");
		};
	}, [socket, clearGameData]);

	// Acciones de Juego (Socket Emitters)
	const startGame = useCallback(
		(room_id_param, rounds = 5) => {
			const targetRoom = room_id_param || roomId;
			socket?.emit("start_game", { room_id: targetRoom, rounds });
		},
		[socket, roomId],
	);

	const nextRound = useCallback(
		(room_id_param) => {
			const targetRoom = room_id_param || roomId;
			socket?.emit("next_round", targetRoom);
		},
		[socket, roomId],
	);

	const resetGame = useCallback(
		(room_id_param) => {
			const targetRoom = room_id_param || roomId;
			socket?.emit("reset_game", targetRoom);
		},
		[socket, roomId],
	);

	const backToLobby = useCallback(() => {
		if (socket && roomId) {
			socket.emit("dismiss_results", { roomId });
		}
		setGameState("lobby");
	}, [socket, roomId]);

	const notifyStopPressedByMe = useCallback(() => {
		if (user) {
			setStoppedBy(user.username || user.firstName || "Yo");
		}
	}, [user]);

	const value = {
		// Game State
		gameState,
		gameError,
		gameLetter,
		gameCategories,
		gameResults,
		gameScores,
		isGameOver,
		roundInfo,
		countdown,
		stoppedBy,
		roundDuration,

		// Actions
		startGame,
		nextRound,
		resetGame,
		backToLobby,
		notifyStopPressedByMe,
		clearError: () => setGameError(null),
	};

	return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
