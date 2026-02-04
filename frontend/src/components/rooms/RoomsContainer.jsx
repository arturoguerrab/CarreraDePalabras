import { useState, useEffect } from "react";
import { useRoom } from "../../context/RoomContext.jsx";
import RoomsView from "./RoomsView";

//Gestiona la lógica para unirse o crear salas de juego.
const RoomsContainer = () => {
	const { roomError, createRoom, joinRoom, clearError } = useRoom();
	const [roomToJoin, setRoomToJoin] = useState("");

	// Limpiar errores solo al montar el componente
	useEffect(() => {
		clearError();
	}, []);

	/**
	 * @param {Event} e - Evento de envío del formulario.
	 */
	const handleJoinRoom = (e) => {
		e.preventDefault();
		if (!roomToJoin.trim()) return;
		joinRoom(roomToJoin.trim().toUpperCase());
	};

	const handleCreateRoom = () => {
		clearError();
		createRoom();
	};

	return (
		<RoomsView
			roomToJoin={roomToJoin}
			handleRoomToJoinChange={(e) => {
				setRoomToJoin(e.target.value);
				if (roomError) clearError();
			}}
			handleCreateRoom={handleCreateRoom}
			handleJoinRoom={handleJoinRoom}
			error={roomError}
			clearError={clearError}
		/>
	);
};

export default RoomsContainer;
