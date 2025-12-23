import StopView from "./StopView.jsx";

const StopContainer = ({ entradaDatos, onPlayAgain, onNextRound, onLeave, loading, error, scores, isGameOver, roundInfo, isOwner }) => {
  // Ahora 'entradaDatos' ya viene validado desde el servidor (socketHandler)
  // No necesitamos llamar a la API aquí, solo mostrar los datos.
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
          isOwner={isOwner}
    />
  );
};

export default StopContainer;
