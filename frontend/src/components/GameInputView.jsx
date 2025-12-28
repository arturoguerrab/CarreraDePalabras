import React from "react";

const GameInputView = ({ handleSubmit, handleInputChange, letra, categories = [] }) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const form = e.target.form;
      const inputs = Array.from(form.querySelectorAll("input"));
      const index = inputs.indexOf(e.target);
      if (index > -1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#6366f1] flex items-center justify-center px-4 py-8 font-['Press_Start_2P'] relative overflow-hidden">
       {/* Fondo Cuadriculado */}
       <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>

       {/* Decoración */}
       <div className="absolute top-24 left-8 w-12 h-12 bg-[#c084fc] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transform -rotate-12 z-0"></div>
       <div className="absolute bottom-24 right-8 w-16 h-16 bg-[#fbbf24] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transform rotate-6 z-0"></div>

        <div className="w-full max-w-4xl relative z-10">
            {/* Card Principal */}
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] rounded-3xl p-6 md:p-12 relative">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                    <div>
                        <h1 className="text-2xl md:text-4xl text-black mb-2 leading-relaxed drop-shadow-sm">
                            ¡A JUGAR!
                        </h1>
                        <p className="text-gray-500 text-xs md:text-sm">Rellena los campos</p>
                    </div>
                    
                    {/* Indicador de Letra (Bloque Flotante) */}
                    <div className="relative group">
                        <div className="w-24 h-24 bg-[#fbbf24] rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center transform group-hover:-translate-y-1 transition-transform">
                            <span className="text-5xl text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">{letra}</span>
                        </div>
                        <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-black uppercase">Letra</span>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                        {categories.map((cat) => (
                            <div key={cat}>
                                <label className="block text-black text-xs mb-2 uppercase ml-1">
                                    {cat}
                                </label>
                                <input
                                    type="text"
                                    onChange={(e) => handleInputChange(cat, e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full bg-gray-50 border-4 border-gray-200 focus:border-black rounded-xl p-3 text-black text-base md:text-sm focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all outline-none"
                                    autoComplete="off"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Botón Footer */}
                    <div className="mt-12 flex justify-center">
                        <button
                            onClick={handleSubmit}
                            className="px-10 py-4 bg-[#ef4444] rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-2 active:shadow-none transition-all"
                        >
                            <span className="text-white text-xl uppercase drop-shadow-md">
                                ¡STOP!
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
};

export default GameInputView;
