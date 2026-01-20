import React, { useState } from "react";

/**
 * STOP VIEW
 * Renderiza los resultados de cada ronda, el podio final y estados de carga/error.
 */
const StopView = ({ 
  visual, 
  loading, 
  error, 
  onPlayAgain, 
  onNextRound, 
  onLeave, 
  scores, 
  isGameOver, 
  roundInfo, 
  players,
  userEmail,
  countdown,
  stoppedBy
}) => {
  const [showFinalScore, setShowFinalScore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReadyClick = () => {
    if (isSubmitting || (countdown && countdown > 0)) return;
    setIsSubmitting(true);
    onNextRound();
    // Reset debounce after a bit
    setTimeout(() => setIsSubmitting(false), 800);
  };

  /**
   * ESTADO: CARGANDO RESULTADOS
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#6366f1] flex items-center justify-center font-['Press_Start_2P'] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>
        <div className="text-center z-10">
          <div className="animate-spin text-7xl mb-10 drop-shadow-md">⚙️</div>
          <h2 className="text-lg text-white uppercase drop-shadow-md animate-pulse">Procesando respuestas...</h2>
        </div>
      </div>
    );
  }

  /**
   * ESTADO: ERROR
   */
  if (error) {
    return (
      <div className="min-h-screen bg-[#6366f1] flex items-center justify-center font-['Press_Start_2P'] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] rounded-3xl p-10 max-w-md w-full text-center z-10">
            <div className="text-red-500 text-6xl mb-6">⚠️</div>
            <h3 className="text-base text-black mb-4 uppercase font-bold">Error Crítico</h3>
            <p className="text-[10px] text-gray-500 leading-loose mb-10 uppercase">{error}</p>
            <button onClick={onLeave} className="w-full py-4 bg-[#ef4444] border-4 border-black text-white text-[10px] uppercase hover:bg-red-500 rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all">
              Volver al Menú
            </button>
        </div>
      </div>
    );
  }

  // --- VISTA DE GANADOR (FIN DEL JUEGO / PODIO) ---
  if (isGameOver && showFinalScore) {
    const sortedScores = Object.entries(scores || {}).sort((a, b) => b[1] - a[1]);
    const winner = sortedScores[0];

    return (
      <div className="min-h-screen bg-[#fbbf24] flex items-center justify-center font-['Press_Start_2P'] p-4 relative overflow-hidden">
         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>

        <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-[2.5rem] p-10 max-w-lg w-full relative z-10">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[#ef4444] border-4 border-black text-white px-8 py-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[10px] uppercase tracking-widest whitespace-nowrap">
                🏆 PODIO FINAL 🏆
            </div>
            
            <div className="text-center mt-8 mb-10">
                <div className="text-8xl mb-6 drop-shadow-md">👑</div>
                <h2 className="text-xl text-black mb-2 uppercase truncate px-4">
                  {winner ? winner[0] : "Nadie"}
                </h2>
                <div className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-lg border-2 border-blue-200 text-xs">
                  {winner ? winner[1] : 0} PUNTOS
                </div>
            </div>

            <div className="bg-gray-50 border-4 border-black rounded-2xl p-6 mb-10">
                <h3 className="text-[10px] text-gray-400 mb-6 uppercase border-b-2 border-dashed border-gray-200 pb-3 tracking-widest text-center">Clasificación</h3>
                <ul className="space-y-5">
                    {sortedScores.map(([player, score], index) => (
                    <li key={player} className="flex justify-between items-center">
                        <span className="flex items-center gap-4 text-[10px] text-black uppercase truncate pr-2">
                            <span className={`${index === 0 ? "text-yellow-500 scale-125" : "text-gray-400"} font-bold`}>#{index + 1}</span>
                            {player}
                        </span>
                        <span className="text-[#ef4444] text-[10px] whitespace-nowrap">{score} PTS</span>
                    </li>
                    ))}
                </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={onPlayAgain} className="flex-grow bg-[#16a34a] border-4 border-black text-white text-[10px] py-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all uppercase">
                  🔄 Volver a la Sala
                </button>
                <button onClick={onLeave} className="flex-grow bg-[#ef4444] border-4 border-black text-white text-[10px] py-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all uppercase">
                  🚪 Salir
                </button>
            </div>
        </div>
      </div>
    );
  }

  /**
   * VISTA DE RESULTADOS DE RONDA
   */
  return (
    <div className="min-h-screen bg-[#6366f1] px-4 py-12 font-['Press_Start_2P'] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>

        <div className="max-w-6xl mx-auto relative z-10">
            {/* Cabecera de Resultados */}
            <header className="text-center mb-12">
                <h1 className="text-3xl text-white mb-6 uppercase drop-shadow-[6px_6px_0px_rgba(0,0,0,0.3)] tracking-tighter">RESULTADOS</h1>
                {roundInfo && (
                    <div className="inline-block bg-yellow-400 border-4 border-black px-6 py-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <p className="text-black text-[10px] uppercase font-bold tracking-widest">
                          RONDA {roundInfo.current} / {roundInfo.total}
                        </p>
                    </div>
                )}
            </header>

            {/* Listado por Categorías */}
            <main className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)] rounded-[3rem] p-8 md:p-12 mb-12">
                <div className="space-y-14">
                    {visual.length > 0 ? visual.map((bloque, idx) => (
                        <section key={idx}>
                            <h2 className="text-xs text-blue-600 mb-6 border-b-4 border-blue-600 inline-block pb-1 uppercase tracking-widest">
                                {bloque.categoria}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {bloque.respuestas.map((item, i) => (
                                    <div key={i} className={`relative p-5 border-4 rounded-2xl transition-all hover:scale-105 bg-gray-50 flex flex-col justify-between ${item.es_valida ? 'border-green-400 shadow-[4px_4px_0px_0px_rgba(72,187,120,0.2)]' : 'border-red-400 shadow-[4px_4px_0px_0px_rgba(245,101,101,0.2)]'}`}>
                                        
                                        <div>
                                            <p className="text-[8px] text-gray-400 uppercase mb-3 font-bold tracking-tighter">{item.nombre}</p>
                                            <p className="text-xs text-black mb-3 break-words leading-relaxed">
                                                {item.palabra || <span className="text-gray-200 italic">-- sin respuesta --</span>}
                                            </p>
                                            <p className={`text-[8px] leading-relaxed uppercase ${item.es_valida ? 'text-green-500' : 'text-red-500'}`}>
                                                {item.mensaje}
                                            </p>
                                        </div>
                                        
                                        {/* Insignia de Puntos */}
                                        <div className={`absolute -top-4 -right-4 w-12 h-12 border-4 border-black rounded-full flex items-center justify-center text-white text-xs shadow-md font-bold ${item.es_valida ? 'bg-green-500' : 'bg-red-500'}`}>
                                            {item.es_valida ? `+${item.puntos}` : '0'}
                                        </div>

                                        {/* Stopper Badge */}
                                        {stoppedBy && item.nombre === stoppedBy && (
                                          <div className="absolute top-2 right-2 transform rotate-[10deg]">
                                            <div className="bg-[#fbbf24] text-black text-[6px] border-2 border-black px-2 py-0.5 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold uppercase tracking-tighter animate-pulse">
                                              ⚡ Stopper
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )) : (
                      <div className="text-center py-20">
                          <p className="text-gray-300 text-xs uppercase animate-pulse">Esperando datos de la ronda...</p>
                      </div>
                    )}
                </div>

                {/* Acciones de Navegación */}
                <footer className="mt-16 pt-10 border-t-4 border-black flex flex-col items-center gap-8">
                    {!isGameOver ? (
                        <div className="flex flex-col items-center gap-6 w-full max-w-md">
                            <div className="flex flex-wrap justify-center gap-3">
                              {players?.map(p => (
                                <div key={p.email} className={`w-3 h-3 rounded-full border-2 border-black ${p.ready ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-200'}`} title={p.displayName} />
                              ))}
                            </div>
                            
                            <button 
                                onClick={handleReadyClick} 
                                disabled={isSubmitting || (countdown && countdown > 0)}
                                className={`w-full py-5 px-12 border-4 border-black text-white text-[10px] uppercase rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed ${players?.find(p => p.email === userEmail)?.ready ? 'bg-[#ef4444] hover:bg-red-500' : 'bg-[#16a34a] hover:bg-green-500'}`}
                            >
                                {countdown && countdown > 0 ? (
                                  <><span className="text-xl mr-3 animate-pulse">🔥</span> {countdown}...</>
                                ) : players?.find(p => p.email === userEmail)?.ready ? '🕒 CANCELAR LISTO' : '✅ MARCAR LISTO'}
                            </button>
                            
                            <p className="text-[8px] text-gray-400 uppercase tracking-tighter text-center">
                                Esperando jugadores: {players?.filter(p => !p.ready).length} / {players?.length}
                            </p>
                        </div>
                    ) : (
                        <button onClick={() => setShowFinalScore(true)} className="py-5 px-12 bg-[#fbbf24] border-4 border-black text-black text-[10px] uppercase hover:bg-yellow-500 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-bold">
                            🏆 Ver Ganador Final
                        </button>
                    )}
                    
                    <div className="flex gap-4">
                      <button
                          onClick={onLeave}
                          disabled={countdown && countdown > 0}
                          className="py-4 px-8 bg-white border-4 border-black text-black text-[8px] uppercase hover:bg-gray-100 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          🚪 Salir
                      </button>
                    </div>
                </footer>
            </main>
        </div>
    </div>
  );
};

export default StopView;
