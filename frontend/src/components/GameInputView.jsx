import React from "react";

const GameInputView = ({ handleSubmit, handleInputChange, letra, categories = [] }) => {
  const handwritingStyle = { fontFamily: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", sans-serif' };

  return (
    <div className="min-h-screen bg-[#e8e8e8] flex items-center justify-center px-4 py-8 font-sans relative overflow-hidden">
       {/* Textura de fondo (puntos) */}
       <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'radial-gradient(#a1a1aa 1px, transparent 1px)',
            backgroundSize: '20px 20px'
        }}></div>

        <div className="w-full max-w-4xl relative z-10">
            {/* Cuaderno de espiral */}
            <div className="flex shadow-2xl transform rotate-1">
                {/* Espiral (Binding) */}
                <div className="w-12 bg-[#292524] flex flex-col items-center py-6 space-y-6 rounded-l-lg relative z-20 border-r-4 border-[#1c1917]">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="relative w-full h-6">
                            <div className="absolute left-2 top-1 w-3 h-3 bg-[#1c1917] rounded-full shadow-inner"></div>
                            <div className="absolute left-3 top-2 w-10 h-2 bg-gray-400 rounded-full transform -rotate-12 shadow-md border-t border-white/30"></div>
                        </div>
                    ))}
                </div>

                {/* Papel */}
                <div className="flex-1 bg-[#fffef0] rounded-r-lg relative overflow-hidden min-h-[80vh]"
                     style={{
                         backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px)',
                         backgroundSize: '100% 2rem',
                         lineHeight: '2rem'
                     }}>
                    
                    {/* Margen Rojo */}
                    <div className="absolute top-0 bottom-0 left-8 w-px bg-red-300/60 h-full"></div>

                    <div className="p-8 pl-12 relative z-10 h-full flex flex-col">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6 border-b-2 border-slate-300 pb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800" style={handwritingStyle}>
                                    ¡A Jugar!
                                </h1>
                                <p className="text-slate-500 text-sm font-bold" style={handwritingStyle}>Rellena las categorías</p>
                            </div>
                            <div className="relative">
                                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg transform rotate-12 border-4 border-white">
                                    {letra}
                                </div>
                                <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-slate-500 uppercase tracking-widest">Letra</span>
                            </div>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                {categories.map((cat) => (
                                    <div key={cat} className="mb-4 group">
                                        <label className="block text-slate-500 text-sm font-bold uppercase tracking-wide mb-1" style={handwritingStyle}>
                                            {cat}
                                        </label>
                                        <input
                                            type="text"
                                            onChange={(e) => handleInputChange(cat, e.target.value)}
                                            className="w-full bg-transparent border-b-2 border-blue-200 focus:border-blue-600 outline-none text-blue-900 text-xl h-8 pt-1 placeholder-blue-200/50 transition-colors"
                                            style={handwritingStyle}
                                            autoComplete="off"
                                        />
                                    </div>
                                ))}
                            </div>
                        </form>

                        {/* Botón Footer */}
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={handleSubmit}
                                className="px-12 py-4 bg-red-500 text-white font-black text-3xl uppercase tracking-widest rounded-full shadow-[0_6px_0_rgb(153,27,27)] active:shadow-none active:translate-y-[6px] transform transition-all hover:bg-red-600 hover:scale-105"
                                style={{ fontFamily: '"Arial Black", sans-serif' }}
                            >
                                ¡STOP!
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default GameInputView;
