import React, { useState, useEffect, useContext } from "react";
import { StopContext } from "../../context/StopContext";
import RoomsView from "./RoomsView";

/**
 * ROOMS CONTAINER
 * Gestiona la lógica para unirse o crear salas de juego.
 * Aunque actualmente está ligado a StopContext, su estructura es agnóstica al juego.
 */
const RoomsContainer = () => {
  const { gameError, createRoom, joinRoom, clearError } = useContext(StopContext);
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
