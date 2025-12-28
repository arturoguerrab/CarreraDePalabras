import React, { useState } from "react";

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

  return (
    <div className="min-h-screen bg-[#6366f1] flex items-center justify-center px-4 py-12 font-['Press_Start_2P'] relative overflow-hidden">
        {/* Fondo Cuadriculado */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>

        {/* Decoración */}
        <div className="absolute top-10 right-10 w-16 h-16 bg-[#ef4444] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transform rotate-45"></div>
        <div className="absolute bottom-10 left-10 w-20 h-8 bg-[#60a5fa] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transform -rotate-3"></div>

        <div className="w-full max-w-2xl relative z-10">
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] rounded-3xl p-8 relative">
                
                <div className="text-center mb-8">
                    <div className="inline-block bg-yellow-100 border-4 border-black px-4 py-2 rounded-xl mb-4 shadow-sm">
                        <h1 className="text-sm text-black uppercase">SALA: {roomId}</h1>
                    </div>
                    <div className="flex justify-center items-center gap-2">
                        <div className={`w-4 h-4 border-2 border-black ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <p className="text-[10px] text-gray-500 uppercase">
                            {isConnected ? "Conectado" : "Desconectado"}
                        </p>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-xs text-black mb-4 border-b-4 border-black pb-2 uppercase">Jugadores</h3>
                    <ul className="space-y-3">
                        {players.map((player, index) => (
                            <li key={player.email} className="flex items-center gap-3 text-xs bg-gray-50 p-3 border-2 border-gray-200 rounded-lg">
                                <span className="text-blue-500">#{index + 1}</span>
                                <span className={player.email === userEmail ? "text-black underline decoration-wavy" : "text-gray-600"}>
                                    {player.displayName}
                                </span>
                                {players[0].email === player.email && <span>👑</span>}
                                {player.email === userEmail && <span className="text-[8px] bg-blue-100 text-blue-600 px-2 py-1 rounded border border-blue-200">TÚ</span>}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="border-t-4 border-black pt-6">
                    {isOwner ? (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between bg-gray-100 p-4 rounded-xl border-4 border-black">
                                <label className="text-xs text-black uppercase">Rondas:</label>
                                <select
                                    value={rounds}
                                    onChange={(e) => setRounds(Number(e.target.value))}
                                    className="bg-white border-2 border-black p-1 text-xs outline-none rounded"
                                >
                                    <option value={3}>3</option>
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                </select>
                            </div>

                            <button
                                onClick={() => handleStartGame(rounds)}
                                className="w-full py-4 bg-[#16a34a] border-4 border-black text-white text-sm uppercase hover:bg-green-500 rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                            >
                                <span className="text-xl mr-2">🚀</span> ¡Empezar!
                            </button>
                        </div>
                    ) : (
                        <div className="text-center p-4 bg-gray-100 border-4 border-dashed border-gray-300 rounded-xl">
                            <p className="text-gray-400 text-xs animate-pulse uppercase">
                                Esperando al anfitrión...
                            </p>
                        </div>
                    )}

                    <button
                        onClick={handleLeave}
                        className="w-full mt-4 py-4 bg-[#ef4444] border-4 border-black text-white text-sm uppercase hover:bg-red-500 rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                        <span className="text-xl mr-2">🚪</span> Salir
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default StopMpView;
