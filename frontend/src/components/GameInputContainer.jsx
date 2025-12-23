import React, { useState, useEffect, useContext, useRef } from "react";
import GameInputView from "./GameInputView";
import StopContainer from "./StopContainer";
import { StopContext } from "../context/StopContext";

const GameInputContainer = () => {
  const { timer, gameLetter, socket, roomId, gameCategories } = useContext(StopContext);
  const playerInfoRef = useRef({}); // Usamos Ref para no reiniciar el socket al escribir
  const [letra, setLetra] = useState(gameLetter || "A");
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para bloquear

  // Función para enviar datos, ya sea por click voluntario o forzado
  const sendData = (isStopTrigger = false) => {
    if (isSubmitting) return; // Si ya se envió, no hacer nada
    setIsSubmitting(true); // Bloquear futuros envíos

    // Solo enviamos el objeto simple: { Color: "Rojo", Ciudad: "Madrid" ... }
    // El servidor se encarga de armar la estructura compleja.
    const payload = {
      roomId,
      answers: playerInfoRef.current, // Leemos el valor actual del ref
    };

    if (isStopTrigger) {
      socket.emit("stop_round", payload);
    } else {
      socket.emit("submit_answers", payload);
    }
  };

  useEffect(() => {
    if (socket) {
      // Escuchar cuando otro jugador presionó Stop
      socket.on("force_submit", () => {
        sendData(false);
      });
      return () => socket.off("force_submit");
    }
  }, [socket, roomId]); // Quitamos playerInfo de las dependencias para evitar reinicios

  const handleSubmit = (e) => {
    e.preventDefault();
    sendData(true);
  };

  const handleInputChange = (categoria, valor) => {
    playerInfoRef.current[categoria] = valor; // Actualizamos el ref directamente
  };

  return (
    <GameInputView
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
      letra={letra}
      categories={gameCategories} // Pasamos las categorías dinámicas
    />
  );
};

export default GameInputContainer;
