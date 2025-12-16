// Importaciones
import { createContext, useState, useEffect, useRef } from "react";
import stopAPI from "../stopAPI";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom"; // 1. Importar el hook useNavigate

// Crecion del contexto
export const StopContext = createContext();

//Componente proveedor del contexto
const StopContextProvider = ({ children }) => {
  //Estados
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate(); // 2. Obtener la función de navegación
  const [socket, setSocket] = useState(null); // <-- Nuevo estado para el socket

  // --- Estado del Juego y la Sala ---
  const [roomId, setRoomId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [gameError, setGameError] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await stopAPI.get("/auth/user");

        if (response.data.isLoggedIn) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error al verificar la sesión:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // useEffect para gestionar la conexión del socket basada en el estado del usuario
  useEffect(() => {
    // Si hay un usuario y no hay un socket, crea la conexión.
    if (user && !socket) {
      const SOCKET_SERVER_URL =
        import.meta.env.VITE_REACT_APP_BACKEND_URL || "http://localhost:3000";

      const newSocket = io(SOCKET_SERVER_URL, {
        withCredentials: true, // Para enviar cookies de sesión
        autoConnect: true, // Conectar automáticamente
      });

      newSocket.on("connect", () => {
        console.log(
          "Socket conectado por el usuario:",
          user.email,
          "con ID:",
          user.id
        );
      });

      newSocket.on("disconnect", (reason) => {
        console.log("Socket desconectado:", reason);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Error de conexión del socket:", error);
      });

      setSocket(newSocket);
    }
    // Si no hay usuario y el socket existe, desconéctalo.
    else if (!user && socket) {
      console.log("Usuario no autenticado, desconectando socket.");
      socket.disconnect();
      setSocket(null);
    }

    // --- Lógica de eventos del socket ---
    if (socket) {
      const handleRoomCreated = (newRoomId) => {
        setRoomId(newRoomId);
        setGameError(null);
        navigate(`/room/${newRoomId}`); // 3. Usar la función para navegar
      };
      const handleJoinedRoom = (joinedRoomId) => {
        setRoomId(joinedRoomId);
        setGameError(null);
        navigate(`/room/${joinedRoomId}`); // <-- AÑADIR NAVEGACIÓN AQUÍ
      };
      const handleUpdatePlayerList = (playerList) => {
        setPlayers(playerList);
      };
      const handleError = (errorMessage) => {
        setGameError(errorMessage);
      };

      socket.on("room_created", handleRoomCreated);
      socket.on("joined_room", handleJoinedRoom);
      socket.on("update_player_list", handleUpdatePlayerList);
      socket.on("error_joining", handleError);

      // Limpieza al desmontar o cuando el socket cambie
      return () => {
        socket.off("room_created", handleRoomCreated);
        socket.off("joined_room", handleJoinedRoom);
        socket.off("update_player_list", handleUpdatePlayerList);
        socket.off("error_joining", handleError);
      };
    }

    // Limpiar estado de la sala si el usuario se desloguea
    if (!user) {
      setRoomId(null);
      setPlayers([]);
    }
  }, [user, socket, navigate]); // Dependencias más robustas

  const login = async (email, password) => {
    const response = await stopAPI.post("/auth/login", { email, password });
    if (response.data.user) {
      setUser(response.data.user);
    }
    // El useEffect [user] se encargará de conectar el socket
    return response;
  };

  const register = async (email, password) => {
    return await stopAPI.post("/auth/register", { email, password });
  };

  const loginWithGoogle = () => {
    window.location.href = `${
      import.meta.env.VITE_REACT_APP_BACKEND_URL || "http://localhost:3000"
    }/auth/google`;
  };

  const logout = async () => {
    try {
      await stopAPI.get("/auth/logout"); // URL simplificada
      setUser(null);
      setRoomId(null); // Limpiar la sala al cerrar sesión
      setPlayers([]);
      // El useEffect [user] se encargará de desconectar y limpiar el socket
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const createRoom = () => {
    socket?.emit("create_room", user);
  };

  const joinRoom = (room_id) => {
    if (room_id.trim()) {
      socket?.emit("join_room", { room_id: room_id, user: user });
    }
  };

  const leaveRoom = (room_id) => {
    if (room_id && user) {
      socket?.emit("leave_room", { room_id: room_id, user: user });
    }
  };
  // --- Funciones de Interacción con el Juego ---

  const value = {
    user,
    isLoading,
    login,
    register,
    loginWithGoogle,
    logout,
    socket,
    // Estado y acciones del juego
    roomId,
    players,
    gameError,
    createRoom,
    joinRoom,
    leaveRoom,
  }; // <-- Exponer el socket
  return <StopContext.Provider value={value}>{children}</StopContext.Provider>;
};

export default StopContextProvider;
