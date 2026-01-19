import { createContext, useState, useEffect, useCallback } from "react";
import stopAPI from "../stopAPI";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";

/**
 * STOP CONTEXT
 * Gestiona el estado global del juego, la autenticación y la comunicación en tiempo real.
 */
export const StopContext = createContext();

export const StopContextProvider = ({ children }) => {
  // --- Estados de Autenticación ---
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);

  // --- Estado del Juego y la Sala ---
  const [roomId, setRoomId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [gameError, setGameError] = useState(null);
  const [gameState, setGameState] = useState("lobby"); // 'lobby', 'playing', 'calculating', 'results'
  const [gameLetter, setGameLetter] = useState("");
  const [gameCategories, setGameCategories] = useState([]);
  const [gameResults, setGameResults] = useState([]);
  const [gameScores, setGameScores] = useState({});
  const [isGameOver, setIsGameOver] = useState(false);
  const [roundInfo, setRoundInfo] = useState({ current: 0, total: 0 });
  const [countdown, setCountdown] = useState(null);
  const [stoppedBy, setStoppedBy] = useState(null); // Who pressed STOP
  const [roundDuration, setRoundDuration] = useState(60); // Default round duration

  /**
   * Limpia el estado del juego para una nueva partida o sala.
   */
  const clearGameData = useCallback(() => {
    setGameResults([]);
    setGameScores({});
    setIsGameOver(false);
    setRoundInfo({ current: 0, total: 0 });
    setGameError(null);
    setCountdown(null);
    setStoppedBy(null);
  }, []);

  // --- Verificación de Sesión Inicial ---
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await stopAPI.get("/auth/user");
        if (response.data.isLoggedIn) setUser(response.data.user);
        else setUser(null);
      } catch (error) {
        console.error("❌ Error de sesión:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  // --- Gestión de Conexión del Socket ---
  useEffect(() => {
    if (user && !socket) {
      const URL = import.meta.env.VITE_REACT_APP_BACKEND_URL || "http://localhost:3000";
      const newSocket = io(URL, { withCredentials: true, autoConnect: true });

      newSocket.on("connect", () => console.log(`🔌 Socket conectado: ${user.email}`));
      newSocket.on("connect_error", (err) => console.error("❌ Error socket:", err));
      
      setSocket(newSocket);
    } else if (!user && socket) {
      socket.disconnect();
      setSocket(null);
    }
  }, [user, socket]);

  // --- Lógica de Eventos de Juego ---
  useEffect(() => {
    if (!socket) return;

    // Handlers definidos fuera para limpieza y claridad
    const onRoomCreated = (id) => {
      setRoomId(id);
      setGameState("lobby");
      setGameError(null);
      navigate(`/room/${id}`);
    };

    const onJoinedRoom = (id) => {
      setRoomId(id);
      setGameState("lobby");
      setGameError(null);
      navigate(`/room/${id}`);
    };

    const onCountdown = (seconds) => {
      setCountdown(seconds);
      setGameError(null);
      setStoppedBy(null); // Clear stoppedBy when countdown starts
    };

    const onGameStarted = ({ letter, categories, roundDuration: duration }) => {
      setCountdown(null);
      setGameLetter(letter);
      setGameCategories(categories || []);
      setGameState("playing");
      setStoppedBy(null); // Ensure stoppedBy is cleared when game starts
      if (duration) setRoundDuration(duration);
    };

    const onRoundResults = (data) => {
      if (data.results) {
        setGameResults(data.results);
        setGameScores(data.scores);
        setIsGameOver(data.isGameOver);
        setRoundInfo({ current: data.round, total: data.totalRounds });
        setStoppedBy(data.stoppedBy || null); // Capture who pressed STOP
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


    // Suscripciones
    socket.on("room_created", onRoomCreated);
    socket.on("joined_room", onJoinedRoom);
    socket.on("update_player_list", setPlayers);
    socket.on("error_joining", (msg) => setGameError(msg));
    socket.on("start_countdown", onCountdown);
    socket.on("game_started", onGameStarted);
    socket.on("round_results", onRoundResults);
    socket.on("calculating_results", onCalculating);
    socket.on("force_submit", onForceSubmit); // Listen for STOP notifications
    socket.on("game_reset", () => {
      setGameState("lobby");
      clearGameData();
    });

    return () => {
      socket.off("room_created", onRoomCreated);
      socket.off("joined_room", onJoinedRoom);
      socket.off("update_player_list");
      socket.off("error_joining");
      socket.off("start_countdown", onCountdown);
      socket.off("game_started", onGameStarted);
      socket.off("round_results", onRoundResults);
      socket.off("calculating_results", onCalculating);
      socket.off("force_submit", onForceSubmit);
      socket.off("game_reset");
    };
  }, [socket, navigate, clearGameData]);

  // --- Acciones de Usuario ---
  const login = useCallback(async (email, password) => {
    const response = await stopAPI.post("/auth/login", { email, password });
    if (response.data.user) setUser(response.data.user);
    return response;
  }, []);

  const register = useCallback((userData) => stopAPI.post("/auth/register", userData), []);

  const logout = useCallback(async () => {
    try {
      await stopAPI.get("/auth/logout");
      setUser(null);
      setRoomId(null);
      setPlayers([]);
    } catch (err) {
      console.error("❌ Error logout:", err);
    }
  }, []);

  const updateUsername = useCallback(async (username) => {
    const res = await stopAPI.post("/auth/set-username", { username });
    if (res.data.user) setUser(res.data.user);
    return res;
  }, []);

  // --- Acciones de Juego (Socket Emitters) ---
  const createRoom = useCallback(() => {
    setGameError(null); // Clear any previous errors
    socket?.emit("create_room", user);
  }, [socket, user]);

  const joinRoom = useCallback((room_id) => {
    if (room_id?.trim()) {
      setGameError(null); // Clear any previous errors
      socket?.emit("join_room", { room_id, user });
    }
  }, [socket, user]);
  const startGame = useCallback((room_id, rounds = 5) => socket?.emit("start_game", { room_id, rounds }), [socket]);
  const nextRound = useCallback((room_id) => socket?.emit("next_round", room_id), [socket]);
  const resetGame = useCallback((room_id) => socket?.emit("reset_game", room_id), [socket]);

  const leaveRoom = useCallback((room_id) => {
    if (room_id && user) {
      socket?.emit("leave_room", { room_id, user });
      setRoomId(null);
      setPlayers([]);
      setGameState("lobby");
      setCountdown(null);
    }
  }, [socket, user]);

  const loginWithGoogle = useCallback(() => {
    const URL = import.meta.env.VITE_REACT_APP_BACKEND_URL || "http://localhost:3000";
    window.location.href = `${URL}/auth/google`;
  }, []);

  const backToLobby = useCallback(() => setGameState("lobby"), []);

  const toggleReady = useCallback((room_id) => {
    if (room_id && socket) {
      socket.emit("toggle_ready", room_id);
    }
  }, [socket]);

  // Optimistic update for stopper to avoid seeing 'loading' screen
  const notifyStopPressedByMe = useCallback(() => {
    if (user) {
        setStoppedBy(user.username || user.firstName || "Yo");
    }
  }, [user]);

  const value = {
    user, isLoading, login, register, updateUsername, loginWithGoogle, logout, socket,
    roomId, players, gameError, createRoom, joinRoom, leaveRoom,
    gameState, gameLetter, gameCategories, startGame, gameResults,
    gameScores, isGameOver, roundInfo, nextRound, resetGame,
    countdown, stoppedBy,
    toggleReady,
    clearError: () => setGameError(null),
    backToLobby,
    notifyStopPressedByMe, // Expose this
    roundDuration,
  };

  return <StopContext.Provider value={value}>{children}</StopContext.Provider>;
};

export default StopContextProvider;
