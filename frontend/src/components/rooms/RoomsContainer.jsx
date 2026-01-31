import React, { useState, useEffect } from "react";
import { useGame } from "../../context/GameContext.jsx";
import RoomsView from "./RoomsView";

/**
 * ROOMS CONTAINER
 * Gestiona la lógica para unirse o crear salas de juego.
 */
const RoomsContainer = () => {
  const { gameError, createRoom, joinRoom, clearError } = useGame();
  const [roomToJoin, setRoomToJoin] = useState("");

  // Limpiar errores solo al montar el componente
  useEffect(() => {
    clearError();
  }, []); // Empty array = solo se ejecuta al montar

  /**
   * Maneja el intento de unirse a una sala existente.
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
          if (gameError) clearError();
        }}
        handleCreateRoom={handleCreateRoom}
        handleJoinRoom={handleJoinRoom}
        error={gameError}
        clearError={clearError}
      />
  );
};

export default RoomsContainer;
