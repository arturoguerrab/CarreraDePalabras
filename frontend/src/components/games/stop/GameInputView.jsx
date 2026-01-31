import React, { useState, useEffect } from "react";
import { useSound } from "../../../context/SoundContext";

/**
 * GAME INPUT VIEW
 * Interfaz de la ronda activa donde el jugador ingresa las respuestas.
 */
const GameInputView = ({ handleSubmit, handleInputChange, letra, categories = [], isSubmitting, roundDuration = 60, stoppedBy }) => {
  const [timeLeft, setTimeLeft] = useState(roundDuration);
  const { playTick } = useSound();

  useEffect(() => {
    // If the round is stopped by someone, we shouldn't continue the timer locally
    if (stoppedBy) return;

    setTimeLeft(roundDuration);
    
    // Timer interval
    const timer = setInterval(() => {
        setTimeLeft((prev) => {
            const newValue = prev - 1;
            
            // Sonido de Tic-Tac
            if (newValue >= 0) {
               playTick(newValue); 
            }

            if (prev <= 1) {
                clearInterval(timer);
                return 0;
            }
            return newValue;
        });
    }, 1000);

    return () => clearInterval(timer);
  }, [roundDuration, stoppedBy]);

  
  /**
   * Facilita la navegación entre inputs con la tecla Enter.
   */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const form = e.target.form;
      const inputs = Array.from(form.querySelectorAll("input"));
      const index = inputs.indexOf(e.target);
      if (index > -1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      } else if (index === inputs.length - 1) {
        handleSubmit();
      }
    }
  };

  const isDisabled = isSubmitting || !!stoppedBy;

  return (
    <div className="min-h-screen bg-[#6366f1] flex items-center justify-center px-4 py-8 font-['Press_Start_2P'] relative overflow-hidden">
        {/* Fondo Cuadriculado */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>

        {/* Notification when someone presses STOP */}

        {/* Decoración Retro */}
        <div className="absolute top-24 left-8 w-12 h-12 bg-[#c084fc] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transform -rotate-12 z-0"></div>
        <div className="absolute bottom-24 right-8 w-16 h-16 bg-[#fbbf24] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transform rotate-6 z-0"></div>

        <div className="w-full max-w-4xl relative z-10">
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] rounded-3xl p-6 md:p-12 relative">
                
                {/* Cabecera del Juego */}
                <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                    <div>
                        <h1 className="text-2xl md:text-4xl text-black mb-2 leading-relaxed drop-shadow-sm uppercase">¡A JUGAR!</h1>
                        <p className="text-gray-400 text-[10px] md:text-xs uppercase tracking-widest">Rellena los campos rápidamente</p>
                    </div>
                    
                    {/* Indicador de Letra y Tiempo */}
                    <div className="flex gap-4">
                         {/* Timer */}
                         <div className={`w-24 h-24 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center transform transition-all ${timeLeft <= 10 ? 'bg-red-500 animate-pulse' : 'bg-white'}`}>
                            <span className={`text-4xl font-black drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)] ${timeLeft <= 10 ? 'text-white' : 'text-black'}`}>{timeLeft}</span>
                            <span className={`text-[8px] uppercase font-bold ${timeLeft <= 10 ? 'text-white' : 'text-gray-500'}`}>Segundos</span>
                         </div>

                        <div className="relative group">
                            <div className="w-24 h-24 bg-[#fbbf24] rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center transform group-hover:-translate-y-1 transition-transform">
                                <span className="text-5xl text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">{letra}</span>
                            </div>
                            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-[8px] text-black uppercase font-bold">Letra</span>
                        </div>
                    </div>
                </header>

                {/* Formulario de Respuestas */}
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                        {categories.map((cat) => (
                            <div key={cat}>
                                <label className="block text-black text-[10px] mb-3 uppercase ml-1 font-bold">
                                    {cat}
                                </label>
                                <input
                                    type="text"
                                    onChange={(e) => handleInputChange(cat, e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="..."
                                    disabled={isDisabled}
                                    className={`w-full bg-gray-50 border-4 border-gray-100 focus:border-black rounded-xl p-4 text-black text-sm md:text-base focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-all outline-none placeholder-gray-300 ${isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-200' : ''}`}
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    spellCheck="false"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Botón Stop */}
                    <div className="mt-14 flex justify-center">
                        <button
                            type="submit"
                            disabled={isDisabled}
                            className="group relative px-12 py-5 bg-[#ef4444] rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-2 active:shadow-none transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="relative z-10 text-white text-xl md:text-2xl uppercase drop-shadow-md">
                              {isSubmitting ? "¡ENVIANDO!" : "¡STOP!"}
                            </span>
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
};

export default GameInputView;
