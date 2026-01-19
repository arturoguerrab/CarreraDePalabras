import React from "react";
import StopView from "./StopView.jsx";

/**
 * STOP CONTAINER
 * Orquestador de la visualización de resultados de una ronda.
 * Recibe los datos ya procesados por el servidor y los delega a StopView.
 */
const StopContainer = ({ 
  entradaDatos, 
  onPlayAgain, 
  onNextRound, 
  onLeave, 
  loading, 
  error, 
  scores, 
  isGameOver, 
  roundInfo,
  players,
  userEmail,
  countdown,
  stoppedBy
}) => {
  // Las validaciones de IA y puntuaciones ya vienen calculadas desde el servidor (socketHandler)
  const visual = entradaDatos || [];

  return (
    <StopView 
      visual={visual} 
      loading={loading} 
      error={error} 
      onPlayAgain={onPlayAgain}
      onNextRound={onNextRound}
      onLeave={onLeave}
      scores={scores}
      isGameOver={isGameOver}
      roundInfo={roundInfo}
      players={players}
      userEmail={userEmail}
      countdown={countdown}
      stoppedBy={stoppedBy}
    />
  );
};

export default StopContainer;
