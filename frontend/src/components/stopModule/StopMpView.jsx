import React, { useState } from "react";
import { Link } from "react-router-dom";

const StopMpView = ({
  isConnected,
  userEmail,
  roomId,
  players,
  handleStartGame,
  handleLeave,
}) => {
  const [rounds, setRounds] = useState(5);
  
  // El dueño es siempre el primer jugador de la lista
  const isOwner = players.length > 0 && players[0].email === userEmail;
  const handwritingStyle = { fontFamily: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", sans-serif' };

  return (
    <div className="min-h-screen bg-[#d6c096] flex items-center justify-center px-4 py-12 font-sans relative overflow-hidden">
        {/* Textura de madera */}
        <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #bfa376 25%, transparent 25%, transparent 75%, #bfa376 75%, #bfa376), repeating-linear-gradient(45deg, #bfa376 25%, #d6c096 25%, #d6c096 75%, #bfa376 75%, #bfa376)',
            backgroundPosition: '0 0, 10px 10px',
            backgroundSize: '20px 20px'
        }}></div>

        <div className="w-full max-w-2xl relative z-10">
            {/* Tablero del Clipboard */}
            <div className="bg-[#5d4037] rounded-3xl p-3 shadow-2xl relative">
                {/* Clip Metálico */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-32 h-16 z-20">
                    <div className="w-full h-full bg-gradient-to-b from-gray-300 to-gray-400 rounded-lg shadow-lg border-t-4 border-gray-500 flex items-center justify-center">
                        <div className="w-24 h-8 bg-black/10 rounded-full border-b border-white/50"></div>
                    </div>
                </div>

                {/* Hoja de Papel */}
                <div className="bg-white min-h-[600px] rounded-lg shadow-md relative overflow-hidden pt-16 px-8 pb-8"
                     style={{
                         backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)',
                         backgroundSize: '100% 2rem',
                         lineHeight: '2rem'
                     }}>
                    
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="text-center mb-6">
                            <div className="inline-block border-4 border-double border-slate-800 px-6 py-1 transform -rotate-1 mb-2">
                                <h1 className="text-3xl font-bold text-slate-800 uppercase tracking-widest" style={handwritingStyle}>
                                    SALA: {roomId}
                                </h1>
                            </div>
                            <div className="flex justify-center items-center gap-2">
                                <span className={`inline-block w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">
                                    {isConnected ? "Conexión Estable" : "Desconectado"}
                                </p>
                            </div>
                        </div>

                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-700 mb-4 border-b-2 border-slate-300 pb-1" style={handwritingStyle}>
                                Lista de Jugadores:
                            </h3>
                            <ul className="space-y-2">
                                {players.map((player, index) => (
                                    <li key={player.email} className="flex items-center gap-3 text-lg text-slate-800" style={handwritingStyle}>
                                        <span className="text-slate-400 font-mono">{index + 1}.</span>
                                        <span className={player.email === userEmail ? "font-bold text-blue-600 decoration-wavy underline" : ""}>
                                            {player.displayName}
                                        </span>
                                        {players[0].email === player.email && <span className="text-xl">👑</span>}
                                        {player.email === userEmail && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full ml-2 font-sans font-bold">TÚ</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-8 border-t-2 border-slate-200 pt-6">
                            {isOwner ? (
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between bg-yellow-50 p-3 rounded border border-yellow-200 transform rotate-1">
                                        <label className="text-slate-600 font-bold" style={handwritingStyle}>Rondas:</label>
                                        <select
                                            value={rounds}
                                            onChange={(e) => setRounds(Number(e.target.value))}
                                            className="bg-transparent font-bold text-slate-800 outline-none border-b border-slate-400 focus:border-blue-500"
                                            style={handwritingStyle}
                                        >
                                            <option value={3}>3</option>
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                        </select>
                                    </div>

                                    <button
                                        onClick={() => handleStartGame(rounds)}
                                        className="w-full py-3 bg-green-100 border-2 border-green-500 text-green-700 font-bold text-xl uppercase tracking-widest hover:bg-green-200 transform transition-all duration-150 hover:-rotate-1 shadow-[3px_3px_0px_rgba(34,197,94,1)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
                                        style={handwritingStyle}
                                    >
                                        ¡Empezar!
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                                    <p className="text-slate-500 animate-pulse font-bold" style={handwritingStyle}>
                                        Esperando al anfitrión...
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handleLeave}
                                className="w-full mt-4 py-3 bg-red-100 border-2 border-red-500 text-red-700 font-bold text-xl uppercase tracking-widest hover:bg-red-200 transform transition-all duration-150 hover:rotate-1 shadow-[3px_3px_0px_rgba(239,68,68,1)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
                                style={handwritingStyle}
                            >
                                Salir de la Sala
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default StopMpView;
