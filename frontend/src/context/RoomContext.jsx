import {
	createContext,
	useState,
	useEffect,
	useCallback,
	useContext,
	useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";

export const RoomContext = createContext();

export const useRoom = () => useContext(RoomContext);

export const RoomContextProvider = ({ children }) => {
	const { socket } = useSocket();
	const { user } = useAuth();
	const navigate = useNavigate();

	const [roomId, setRoomId] = useState(null);
	const [players, setPlayers] = useState([]);
	const [roomError, setRoomError] = useState(null);

	// Handlers de eventos de sala
	useEffect(() => {
		if (!socket) return;

		const onRoomCreated = (id) => {
			setRoomId(id);
			setRoomError(null);
			navigate(`/room/${id}`);
		};

		const onJoinedRoom = (id) => {
			setRoomId(id);
			setRoomError(null);
			navigate(`/room/${id}`);
		};

		const onPlayerListUpdate = (list) => {
			setPlayers(list);
		};

		const onErrorJoining = (msg) => {
			setRoomError(msg);
		};

		socket.on("room_created", onRoomCreated);
		socket.on("joined_room", onJoinedRoom);
		socket.on("update_player_list", onPlayerListUpdate);
		socket.on("error_joining", onErrorJoining);

		return () => {
			socket.off("room_created", onRoomCreated);
			socket.off("joined_room", onJoinedRoom);
			socket.off("update_player_list", onPlayerListUpdate);
			socket.off("error_joining", onErrorJoining);
		};
	}, [socket, navigate]);

	// Actions
	const createRoom = useCallback(() => {
		setRoomError(null);
		socket?.emit("create_room", user);
	}, [socket, user]);

	const joinRoom = useCallback(
		(room_id) => {
			if (room_id?.trim()) {
				setRoomError(null);
				socket?.emit("join_room", { room_id, user });
			}
		},
		[socket, user],
	);

	// Ref para acceder al roomId actual dentro de callbacks sin añadirlo a dependencias
	const roomIdRef = useRef(roomId);

	// Mantener la ref actualizada
	useEffect(() => {
		roomIdRef.current = roomId;
	}, [roomId]);

	const leaveRoom = useCallback(
		(room_id_param) => {
			const targetRoomId = room_id_param || roomIdRef.current;
			if (targetRoomId && user) {
				socket?.emit("leave_room", { room_id: targetRoomId });
				setRoomId(null);
				setPlayers([]);
			}
		},
		[socket, user], // Eliminada dependencia de roomId
	);

	const toggleReady = useCallback(
		(room_id_param) => {
			const targetRoomId = room_id_param || roomId;
			if (targetRoomId && socket) {
				socket.emit("toggle_ready", targetRoomId);
			}
		},
		[socket, roomId],
	);

	const clearError = useCallback(() => setRoomError(null), []);

	const value = {
		roomId,
		players,
		roomError,
		createRoom,
		joinRoom,
		leaveRoom,
		toggleReady,
		clearError,
	};

	return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};
