import React from "react";
import { Link } from "react-router-dom";

/**
 * ROOMS VIEW
 * Interfaz para la selección y creación de salas.
 * @param {Object} props - roomToJoin, handleRoomToJoinChange, handleCreateRoom, handleJoinRoom
 */
const RoomsView = ({
  roomToJoin,
  handleRoomToJoinChange,
  handleCreateRoom,
  handleJoinRoom,
  error,
  clearError
}) => {
  return (
    <div className="min-h-screen bg-[#6366f1] flex items-center justify-center px-4 py-12 font-['Press_Start_2P'] relative overflow-hidden">
      {/* Fondo Cuadriculado */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>

      {/* Decoración */}
      <div className="absolute top-16 left-16 w-12 h-12 bg-[#facc15] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transform rotate-12"></div>
      <div className="absolute bottom-16 right-16 w-8 h-24 bg-[#f472b6] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transform -rotate-6"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] rounded-3xl p-8 relative text-center">
            
            <h1 className="text-2xl text-black mb-2 uppercase font-bold tracking-tighter">JUGAR</h1>
            <p className="text-[10px] text-gray-400 mb-10 uppercase tracking-widest leading-loose">¿Nueva sala o unirse a una?</p>

            <div className="space-y-8">
                {/* Botón Crear */}
                <button 
                  onClick={handleCreateRoom}
                  className="w-full py-5 bg-[#fbbf24] border-4 border-black text-black text-[10px] uppercase hover:bg-yellow-300 rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-bold"
                >
                  <span className="text-xl mr-2">✨</span> Crear Sala
                </button>

                {/* Divisor */}
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t-4 border-black border-dashed opacity-20"></div>
                  <span className="flex-shrink-0 mx-4 text-black text-[8px] uppercase font-bold opacity-30">O únete por código</span>
                  <div className="flex-grow border-t-4 border-black border-dashed opacity-20"></div>
                </div>

                {/* Formulario Unirse */}
                <form onSubmit={handleJoinRoom} className="space-y-5">
                  <div className="relative">
                    <input
                      type="text"
                      value={roomToJoin}
                      onChange={handleRoomToJoinChange}
                      onFocus={() => error && clearError()}
                      className={`w-full bg-gray-50 border-4 p-4 text-black text-sm md:text-base focus:bg-white transition-all outline-none rounded-2xl text-center placeholder-gray-300 uppercase font-bold ${error ? 'border-red-500 bg-red-50 animate-shake' : 'border-black'}`}
                      placeholder="CÓDIGO"
                      maxLength={4}
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-full py-5 bg-[#3b82f6] border-4 border-black text-white text-[10px] uppercase hover:bg-blue-500 rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-bold mt-4"
                  >
                    <span className="text-xl mr-2">🚀</span> Entrar
                  </button>
                </form>
                
                {/* Error message */}
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border-2 border-red-500 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-[8px] text-red-500 uppercase font-bold tracking-tighter leading-relaxed text-center">
                      ⚠️ {error}
                    </p>
                  </div>
                )}
            </div>

            {/* Volver */}
            <div className="mt-12 pt-8 border-t-4 border-black flex justify-center">
                <Link 
                  to="/lobby"
                  onClick={() => clearError()}
                  className="inline-flex items-center gap-3 px-8 py-3 bg-gray-100 border-4 border-black text-black text-[8px] uppercase hover:bg-gray-200 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all font-bold"
                >
                  ⬅️ Menú
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RoomsView;
