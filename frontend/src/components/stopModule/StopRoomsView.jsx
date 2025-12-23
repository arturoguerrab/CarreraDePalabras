import React from "react";

const StopRoomsView = ({
  roomToJoin,
  handleRoomToJoinChange,
  handleCreateRoom,
  handleJoinRoom,
}) => {
  const handwritingStyle = { fontFamily: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", sans-serif' };

  return (
    <div className="min-h-screen bg-[#e8e8e8] flex items-center justify-center px-4 py-12 font-sans relative overflow-hidden">
      {/* Textura de fondo (puntos) */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(#a1a1aa 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}></div>

      <div className="w-full max-w-md relative z-10">
        {/* Cuaderno de espiral */}
        <div className="flex shadow-2xl transform rotate-1 transition-transform hover:rotate-0 duration-300">
          
          {/* Espiral (Binding) */}
          <div className="w-12 bg-[#292524] flex flex-col items-center py-6 space-y-6 rounded-l-lg relative z-20 border-r-4 border-[#1c1917]">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="relative w-full h-6">
                {/* Agujero */}
                <div className="absolute left-2 top-1 w-3 h-3 bg-[#1c1917] rounded-full shadow-inner"></div>
                {/* Alambre */}
                <div className="absolute left-3 top-2 w-10 h-2 bg-gray-400 rounded-full transform -rotate-12 shadow-md border-t border-white/30"></div>
              </div>
            ))}
          </div>

          {/* Papel */}
          <div className="flex-1 bg-[#fffef0] rounded-r-lg relative overflow-hidden min-h-[500px]"
             style={{
               backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px)',
               backgroundSize: '100% 2rem',
               lineHeight: '2rem'
             }}>
            
            {/* Margen Rojo */}
            <div className="absolute top-0 bottom-0 left-8 w-px bg-red-300/60 h-full"></div>

            <div className="p-8 pl-12 relative z-10 h-full flex flex-col justify-center">
              <div className="text-center mb-8">
                <div className="inline-block border-b-4 border-blue-500/30 pb-1 transform -rotate-1">
                  <h1 className="text-3xl font-bold text-slate-800" style={handwritingStyle}>
                    JUGAR
                  </h1>
                </div>
                <p className="text-slate-500 text-sm mt-2 font-bold" style={handwritingStyle}>
                  ¿Crear o Unirse?
                </p>
              </div>

              <div className="space-y-8">
                {/* Opción Crear */}
                <div className="text-center">
                    <button 
                        onClick={handleCreateRoom}
                        className="w-full py-3 bg-yellow-100 border-2 border-yellow-400 text-yellow-800 font-bold text-lg uppercase tracking-widest hover:bg-yellow-200 transform transition-all duration-150 hover:-rotate-1 shadow-[3px_3px_0px_rgba(250,204,21,1)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
                        style={handwritingStyle}
                    >
                        ✨ Crear Sala Nueva
                    </button>
                </div>

                <div className="relative flex py-2 items-center opacity-50">
                    <div className="flex-grow border-t-2 border-slate-400 border-dashed"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 font-bold text-xs uppercase tracking-widest" style={handwritingStyle}>
                    O únete a una
                    </span>
                    <div className="flex-grow border-t-2 border-slate-400 border-dashed"></div>
                </div>

                {/* Opción Unirse */}
                <form onSubmit={handleJoinRoom} className="space-y-4">
                    <div className="relative group">
                        <input
                            type="text"
                            value={roomToJoin}
                            onChange={handleRoomToJoinChange}
                            className="w-full bg-transparent border-b-2 border-blue-200 focus:border-blue-600 outline-none text-blue-900 text-xl h-10 pt-1 placeholder-blue-200 transition-colors text-center"
                            placeholder="ID de la Sala"
                            style={handwritingStyle}
                        />
                    </div>
                    <button 
                        type="submit"
                        className="w-full py-3 bg-green-100 border-2 border-green-400 text-green-800 font-bold text-lg uppercase tracking-widest hover:bg-green-200 transform transition-all duration-150 hover:rotate-1 shadow-[3px_3px_0px_rgba(74,222,128,1)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
                        style={handwritingStyle}
                    >
                        🚀 Unirse
                    </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StopRoomsView;
