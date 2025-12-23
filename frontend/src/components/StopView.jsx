import React, { useState } from "react";

const StopView = ({ visual, loading, error, onPlayAgain, onNextRound, onLeave, scores, isGameOver, roundInfo, isOwner }) => {
  const [showFinalScore, setShowFinalScore] = useState(false);
  const handwritingStyle = { fontFamily: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", sans-serif' };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#d6c096] flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-[#5d4037]" style={handwritingStyle}>Calculando resultados...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#d6c096] flex items-center justify-center font-sans">
        <div className="bg-white p-8 rounded-lg shadow-xl transform -rotate-1 border-2 border-red-200">
            <div className="text-red-500 text-5xl mb-4 text-center">⚠️</div>
            <h3 className="font-bold text-xl text-red-800 mb-2 text-center" style={handwritingStyle}>
            Error de Comunicación
            </h3>
            <p className="text-red-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (!visual || visual.length === 0) {
    return (
      <div className="min-h-screen bg-[#d6c096] flex items-center justify-center font-sans">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
            <h3 className="text-2xl text-slate-700 font-bold mb-4" style={handwritingStyle}>Sin Resultados</h3>
            <button onClick={onLeave} className="bg-slate-700 text-white px-4 py-2 rounded">Volver</button>
        </div>
      </div>
    );
  }

  // --- VISTA DE GANADOR (FIN DEL JUEGO) ---
  if (isGameOver && showFinalScore) {
    const sortedScores = Object.entries(scores || {}).sort((a, b) => b[1] - a[1]);
    const winner = sortedScores[0];

    return (
      <div className="min-h-screen bg-[#d6c096] flex items-center justify-center font-sans p-4 relative overflow-hidden">
         {/* Textura de madera */}
         <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #bfa376 25%, transparent 25%, transparent 75%, #bfa376 75%, #bfa376), repeating-linear-gradient(45deg, #bfa376 25%, #d6c096 25%, #d6c096 75%, #bfa376 75%, #bfa376)',
            backgroundPosition: '0 0, 10px 10px',
            backgroundSize: '20px 20px'
        }}></div>

        <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full relative transform rotate-1 border-4 border-yellow-400">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 px-6 py-2 rounded-full font-black shadow-md border-2 border-white">
                RESULTADOS FINALES
            </div>
            
            <div className="text-center mt-6 mb-8">
                <div className="text-8xl mb-2">🏆</div>
                <h2 className="text-4xl font-bold text-slate-800" style={handwritingStyle}>
                ¡{winner ? winner[0] : "Nadie"} gana!
                </h2>
                <p className="text-xl text-yellow-600 font-bold mt-2" style={handwritingStyle}>
                {winner ? winner[1] : 0} puntos
                </p>
            </div>

            <div className="bg-slate-50 p-4 rounded border-2 border-slate-200 mb-8">
                <h3 className="text-lg font-bold text-slate-500 mb-3 border-b pb-2">Tabla de Posiciones</h3>
                <ul>
                    {sortedScores.map(([player, score], index) => (
                    <li key={player} className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0">
                        <span className="flex items-center gap-2 font-bold text-slate-700">
                            <span className="text-slate-400 font-mono">#{index + 1}</span>
                            {player}
                        </span>
                        <span className="text-blue-600 font-bold">{score} pts</span>
                    </li>
                    ))}
                </ul>
            </div>

            <div className="flex gap-4 justify-center">
                <button onClick={onPlayAgain} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-md transform transition hover:-translate-y-1">Nueva Partida</button>
                <button onClick={onLeave} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded shadow-md transform transition hover:-translate-y-1">Salir</button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#d6c096] px-4 py-8 font-sans relative overflow-hidden">
        {/* Textura de madera */}
        <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #bfa376 25%, transparent 25%, transparent 75%, #bfa376 75%, #bfa376), repeating-linear-gradient(45deg, #bfa376 25%, #d6c096 25%, #d6c096 75%, #bfa376 75%, #bfa376)',
            backgroundPosition: '0 0, 10px 10px',
            backgroundSize: '20px 20px'
        }}></div>

        <div className="max-w-6xl mx-auto relative z-10">
            {/* Cabecera del Clipboard */}
            <div className="bg-[#5d4037] rounded-t-3xl p-4 pb-12 relative shadow-xl">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-32 h-16 z-20">
                    <div className="w-full h-full bg-gradient-to-b from-gray-300 to-gray-400 rounded-lg shadow-lg border-t-4 border-gray-500 flex items-center justify-center">
                        <div className="w-24 h-8 bg-black/10 rounded-full border-b border-white/50"></div>
                    </div>
                </div>
                <h1 className="text-center text-white text-3xl font-bold mt-4 uppercase tracking-widest" style={handwritingStyle}>Resultados</h1>
                {roundInfo && <p className="text-center text-yellow-100 font-mono mt-1">Ronda {roundInfo.current} / {roundInfo.total}</p>}
            </div>

            {/* Contenido del Papel */}
            <div className="bg-white -mt-6 rounded-b-lg shadow-2xl p-6 md:p-10 min-h-[60vh]"
                 style={{
                     backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)',
                     backgroundSize: '100% 2rem',
                     lineHeight: '2rem'
                 }}>
                
                <div className="space-y-8">
                    {visual.map((bloque, idx) => (
                        <div key={idx} className="break-inside-avoid">
                            <h2 className="text-xl font-bold text-slate-800 border-b-2 border-slate-800 inline-block mb-4" style={handwritingStyle}>
                                {bloque.categoria}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {bloque.respuestas.map((item, i) => (
                                    <div key={i} className={`relative p-4 border-2 rounded-lg transform rotate-1 transition-transform hover:scale-105 hover:z-10 bg-white shadow-sm ${item.es_valida ? 'border-green-400' : 'border-red-400'}`}>
                                        {/* Efecto de cinta adhesiva */}
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-16 h-6 bg-yellow-200/80 shadow-sm rotate-1"></div>
                                        
                                        <div className="mt-2">
                                            <p className="text-xs font-bold text-slate-400 uppercase">{item.nombre}</p>
                                            <p className="text-xl font-bold text-slate-800" style={handwritingStyle}>
                                                {item.palabra || <span className="text-slate-300">---</span>}
                                            </p>
                                            <p className={`text-xs mt-1 italic leading-tight ${item.es_valida ? 'text-green-600' : 'text-red-600'}`}>
                                                {item.mensaje}
                                            </p>
                                        </div>
                                        
                                        {/* Sello de Puntuación */}
                                        <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md transform rotate-12 ${item.es_valida ? 'bg-green-500' : 'bg-red-500'}`}>
                                            {item.es_valida ? `+${item.puntos}` : '0'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Acciones */}
                <div className="mt-12 flex flex-wrap justify-center gap-6 border-t-2 border-slate-200 pt-8">
                    {!isGameOver ? (
                        isOwner ? (
                            <button onClick={onNextRound} className="bg-green-100 border-2 border-green-500 text-green-700 font-bold py-3 px-8 rounded shadow-[3px_3px_0px_rgba(34,197,94,1)] transform transition hover:-translate-y-1 active:shadow-none active:translate-y-[3px]" style={handwritingStyle}>
                                ➡️ Siguiente Ronda
                            </button>
                        ) : (
                            <div className="text-slate-400 italic font-bold" style={handwritingStyle}>Esperando al anfitrión...</div>
                        )
                    ) : (
                        <button onClick={() => setShowFinalScore(true)} className="bg-yellow-100 border-2 border-yellow-500 text-yellow-700 font-bold py-3 px-8 rounded shadow-[3px_3px_0px_rgba(234,179,8,1)] transform transition hover:-translate-y-1 active:shadow-none active:translate-y-[3px]" style={handwritingStyle}>
                            🏆 Ver Podio Final
                        </button>
                    )}
                    <button
                        onClick={onLeave}
                        className="bg-red-100 border-2 border-red-500 text-red-700 font-bold py-3 px-8 rounded shadow-[3px_3px_0px_rgba(239,68,68,1)] transform transition hover:-translate-y-1 active:shadow-none active:translate-y-[3px]"
                        style={handwritingStyle}
                    >
                        🚪 Abandonar
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default StopView;
