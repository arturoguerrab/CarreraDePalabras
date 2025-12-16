import React, { useState, useEffect, useContext } from "react";
import { StopContext } from "../../context/StopContext";
import StopRoomsView from "./StopRoomsView"; // 1. Importamos el componente de la vista correcto

const StopRoomsContainer = () => {
  // --- LÓGICA ---
  // Obtenemos todo el estado y las funciones del contexto
  const { socket, roomId, players, gameError, createRoom, joinRoom, user } =
    useContext(StopContext);

  const [roomToJoin, setRoomToJoin] = useState(""); // Estado local para el campo de texto
  const [startPlay, setStartPlay] = useState(false);

  useEffect(() => {
    if (gameError) {
      alert(`Error: ${gameError}`);
      // Podrías limpiar el error en el contexto después de mostrarlo
    }
  }, [gameError]);

  const handleJoinRoom = (e) => {
    e.preventDefault();
    joinRoom(roomToJoin);
  };

  // --- VISTA ---
  // Renderizamos el componente de la vista y le pasamos todo lo que necesita como props
  return (
    <div>
      <StopRoomsView
        roomToJoin={roomToJoin}
        handleRoomToJoinChange={(e) => setRoomToJoin(e.target.value)}
        handleCreateRoom={createRoom}
        handleJoinRoom={handleJoinRoom}
      />
    </div>
  );
};

export default StopRoomsContainer;
