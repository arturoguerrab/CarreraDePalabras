import React, { useState } from "react";

const StopView = ({ visual, loading, error, onPlayAgain, onNextRound, onLeave, scores, isGameOver, roundInfo, isOwner }) => {
  const [showFinalScore, setShowFinalScore] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#6366f1] flex items-center justify-center font-['Press_Start_2P'] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>
        <div className="text-center">
          <div className="animate-spin text-8xl mb-8">⚙️</div>
          <h2 className="text-xl text-white uppercase drop-shadow-md">Calculando...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#6366f1] flex items-center justify-center font-['Press_Start_2P'] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] rounded-2xl p-8 max-w-md text-center">
            <div className="text-red-500 text-8xl mb-6 text-center">⚠️</div>
            <h3 className="text-lg text-red-500 mb-4 uppercase">
            Error
            </h3>
            <p className="text-black text-xs leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  if (!visual || visual.length === 0) {
    return (
      <div className="min-h-screen bg-[#6366f1] flex items-center justify-center font-['Press_Start_2P'] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] rounded-2xl p-10 text-center">
            <h3 className="text-xl text-black mb-6 uppercase">Sin Datos</h3>
            <button onClick={onLeave} className="bg-blue-500 border-4 border-black text-white px-6 py-3 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">
              <span className="text-xl mr-2">⬅️</span> Volver
            </button>
        </div>
      </div>
    );
  }

  // --- VISTA DE GANADOR (FIN DEL JUEGO) ---
  if (isGameOver && showFinalScore) {
    const sortedScores = Object.entries(scores || {}).sort((a, b) => b[1] - a[1]);
    const winner = sortedScores[0];

    return (
      <div className="min-h-screen bg-[#fbbf24] flex items-center justify-center font-['Press_Start_2P'] p-4 relative overflow-hidden">
         {/* Pattern */}
         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>

        <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-8 max-w-md w-full relative">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[#ef4444] border-4 border-black text-white px-6 py-2 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xs uppercase">
                RESULTADOS
            </div>
            
            <div className="text-center mt-6 mb-8">
                <div className="text-8xl mb-6">🏆</div>
                <h2 className="text-xl text-black mb-2 uppercase">
                {winner ? winner[0] : "Nadie"}
                </h2>
                <p className="text-sm text-blue-500 mt-2">
                {winner ? winner[1] : 0} PUNTOS
                </p>
            </div>

            <div className="bg-gray-100 border-4 border-black rounded-xl p-4 mb-8">
                <h3 className="text-xs text-black mb-4 uppercase border-b-4 border-black pb-2">Ranking</h3>
                <ul className="space-y-4">
                    {sortedScores.map(([player, score], index) => (
                    <li key={player} className="flex justify-between items-center text-xs">
                        <span className="flex items-center gap-3 text-black">
                            <span className="text-blue-600">#{index + 1}</span>
                            {player}
                        </span>
                        <span className="text-[#ef4444]">{score}</span>
                    </li>
                    ))}
                </ul>
            </div>

            <div className="flex gap-4 justify-center">
                <button onClick={onPlayAgain} className="bg-[#16a34a] border-4 border-black text-white text-xs py-3 px-4 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">
                  <span className="text-xl mr-2">🔄</span> Nueva Partida
                </button>
                <button onClick={onLeave} className="bg-[#ef4444] border-4 border-black text-white text-xs py-3 px-4 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">
                  <span className="text-xl mr-2">🚪</span> Salir
                </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#6366f1] px-4 py-8 font-['Press_Start_2P'] relative overflow-hidden">
        {/* Fondo Cuadriculado */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>

        {/* Decoración */}
        <div className="absolute top-10 left-10 w-16 h-16 bg-[#ef4444] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transform -rotate-6"></div>
        <div className="absolute bottom-10 right-10 w-12 h-12 bg-[#fbbf24] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transform rotate-12"></div>

        <div className="max-w-6xl mx-auto relative z-10">
            {/* Cabecera */}
            <div className="text-center mb-8">
                <h1 className="text-3xl text-white mb-4 uppercase drop-shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">Resultados</h1>
                {roundInfo && (
                    <div className="inline-block bg-white border-4 border-black px-4 py-2 rounded-lg shadow-sm">
                        <p className="text-black text-xs">Ronda {roundInfo.current} / {roundInfo.total}</p>
                    </div>
                )}
            </div>

            {/* Contenido Principal */}
            <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)] rounded-3xl p-6 md:p-10 min-h-[60vh]">
                
                <div className="space-y-8">
                    {visual.map((bloque, idx) => (
                        <div key={idx} className="break-inside-avoid">
                            <h2 className="text-sm text-black mb-4 border-b-4 border-black inline-block pb-2 uppercase">
                                {bloque.categoria}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {bloque.respuestas.map((item, i) => (
                                    <div key={i} className={`relative p-4 border-4 rounded-xl transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-gray-50 ${item.es_valida ? 'border-green-500' : 'border-red-500'}`}>
                                        
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase mb-2">{item.nombre}</p>
                                            <p className="text-sm text-black truncate mb-2">
                                                {item.palabra || <span className="text-gray-400">---</span>}
                                            </p>
                                            <p className={`text-[10px] ${item.es_valida ? 'text-green-600' : 'text-red-600'}`}>
                                                {item.mensaje}
                                            </p>
                                        </div>
                                        
                                        {/* Sello de Puntuación */}
                                        <div className={`absolute -top-4 -right-4 w-12 h-12 border-2 border-black rounded-full flex items-center justify-center text-white text-sm shadow-sm ${item.es_valida ? 'bg-green-500' : 'bg-red-500'}`}>
                                            {item.es_valida ? `+${item.puntos}` : '0'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Acciones */}
                <div className="mt-12 flex flex-wrap justify-center gap-6 pt-8 border-t-4 border-black">
                    {!isGameOver ? (
                        isOwner ? (
                            <button onClick={onNextRound} className="bg-[#16a34a] border-4 border-black text-white text-xs py-4 px-8 rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all">
                                <span className="text-xl mr-2">➡️</span> Siguiente Ronda
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 text-black text-xs bg-gray-100 border-4 border-black px-6 py-3 rounded-xl">
                                <span className="text-xl mr-2 animate-pulse">⏳</span> Esperando al anfitrión...
                            </div>
                        )
                    ) : (
                        <button onClick={() => setShowFinalScore(true)} className="bg-[#fbbf24] border-4 border-black text-black text-xs py-4 px-8 rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all">
                            <span className="text-xl mr-2">🏆</span> Ver Podio Final
                        </button>
                    )}
                    <button
                        onClick={onLeave}
                        className="bg-[#ef4444] border-4 border-black text-white text-xs py-4 px-8 rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                        <span className="text-xl mr-2">🚪</span> Abandonar
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default StopView;
