import React, { useState, useEffect, useContext, useRef } from "react";
import { StopContext } from "../../../context/StopContext";
import GameInputView from "./GameInputView";

/**
 * GAME INPUT CONTAINER
 * Gestiona el estado local de las respuestas del jugador durante la ronda.
 * Utiliza un Ref para las respuestas para evitar rerenders innecesarios que 
 * podrían afectar el rendimiento o interrumpir la conexión del socket en casos extremos.
 */
const GameInputContainer = () => {
  const { gameLetter, socket, roomId, gameCategories, stoppedBy, notifyStopPressedByMe, roundDuration } = useContext(StopContext);
  
  // Referencia para almacenar las respuestas sin provocar rerenders al escribir
  const answersRef = useRef({});
  
  // Estado para bloquear múltiples envíos
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Envía las respuestas al servidor.
   * @param {boolean} isStopTrigger - Indica si el envío fue provocado por el botón "STOP" (termina la ronda para todos).
   */
  const sendData = (isStopTrigger = false) => {
    if (isSubmitting || !socket) return;
    setIsSubmitting(true);

    const payload = {
      roomId,
      answers: answersRef.current,
    };

    if (isStopTrigger) {
      socket.emit("stop_round", payload);
    } else {
      socket.emit("submit_answers", payload);
    }
  };

  useEffect(() => {
    // Scroll to top on mobile/small screens when round starts
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Escuchar si la ronda termina forzosamente (ej. otro jugador presionó STOP o se acabó el tiempo)
    const handleForceSubmit = () => {
      sendData(false);
    };

    socket.on("force_submit", handleForceSubmit);

    return () => {
      socket.off("force_submit", handleForceSubmit);
    };
  }, [socket, roomId]);

  /**
   * Maneja el envío voluntario de respuestas (Botón STOP).
   */
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    // Optimistic update: Show notification immediately for the stopper
    notifyStopPressedByMe();
    sendData(true);
  };

  /**
   * Actualiza el valor de una categoría en la referencia de respuestas.
   */
  const handleInputChange = (category, value) => {
    answersRef.current[category] = value;
  };

  return (
    <GameInputView
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
      letra={gameLetter}
      categories={gameCategories}
      isSubmitting={isSubmitting}
      stoppedBy={stoppedBy}
      roundDuration={roundDuration}
    />
  );
};

export default GameInputContainer;
