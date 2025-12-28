import React from "react";
import { Link } from "react-router-dom";

const StopRoomsView = ({
  roomToJoin,
  handleRoomToJoinChange,
  handleCreateRoom,
  handleJoinRoom,
}) => {
  return (
    <div className="min-h-screen bg-[#6366f1] flex items-center justify-center px-4 py-12 font-['Press_Start_2P'] relative overflow-hidden">
      {/* Fondo Cuadriculado (Pixel Grid) */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>

      {/* Decoración: Bloques Arcade */}
      <div className="absolute top-16 left-16 w-12 h-12 bg-[#facc15] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transform rotate-12"></div>
      <div className="absolute bottom-16 right-16 w-8 h-24 bg-[#f472b6] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transform -rotate-6"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] rounded-3xl p-8 relative text-center">
            
            <h1 className="text-2xl text-black mb-2 uppercase">JUGAR</h1>
            <p className="text-xs text-gray-500 mb-8">¿Crear o Unirse?</p>

            <div className="space-y-8">
                {/* Opción Crear */}
                <button 
                    onClick={handleCreateRoom}
                    className="w-full py-4 bg-[#fbbf24] border-4 border-black text-black text-xs uppercase hover:bg-yellow-300 rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                    <span className="text-xl mr-2">✨</span> Crear Sala
                </button>

                <div className="relative flex py-2 items-center opacity-50">
                    <div className="flex-grow border-t-4 border-black border-dashed"></div>
                    <span className="flex-shrink-0 mx-4 text-black text-[10px] uppercase">O únete</span>
                    <div className="flex-grow border-t-4 border-black border-dashed"></div>
                </div>

                {/* Opción Unirse */}
                <form onSubmit={handleJoinRoom} className="space-y-4">
                    <input
                        type="text"
                        value={roomToJoin}
                        onChange={handleRoomToJoinChange}
                        className="w-full bg-gray-100 border-4 border-black p-3 text-black text-base md:text-sm focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all outline-none rounded-xl text-center placeholder-gray-400"
                        placeholder="ID DE SALA"
                    />
                    <button 
                        type="submit"
                        className="w-full py-4 bg-[#16a34a] border-4 border-black text-white text-xs uppercase hover:bg-green-500 rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                        <span className="text-xl mr-2">🚀</span> Unirse
                    </button>
                </form>
            </div>

            <div className="mt-8 border-t-4 border-black pt-6">
                <Link 
                    to="/lobby"
                    className="block w-full py-4 bg-[#ef4444] border-4 border-black text-white text-xs uppercase hover:bg-red-400 rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                    <span className="text-xl mr-2">⬅️</span> Volver
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StopRoomsView;
