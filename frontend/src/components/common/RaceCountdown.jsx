import { useState, useEffect, useRef } from "react";
import { useSocket } from "../../context/SocketContext.jsx";
import { useSound } from "../../context/SoundContext.jsx";

/**
 * Componente global que muestra una cuenta regresiva animada antes de iniciar una ronda.
 * Se activa mediante el evento de socket 'start_countdown'.
 */
const RaceCountdown = () => {
  const { socket } = useSocket();
  const { playCountdown } = useSound();
  const [count, setCount] = useState(null);
  const [animate, setAnimate] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    /**
     * @param {number} seconds - Segundos iniciales.
     */
    const handleCountdown = (seconds) => {
      if (intervalRef.current) clearInterval(intervalRef.current);

      let current = seconds;

      const triggerAnimation = (val) => {
        setCount(val);
        setAnimate(true);
        // Sonido
        if (val === "YA!") {
          playCountdown(true);
        } else {
          playCountdown(false);
        }

        // Pequeño retardo para reiniciar la animación
        setTimeout(() => setAnimate(false), 300);
      };

      triggerAnimation(current);

      intervalRef.current = setInterval(() => {
        current--;
        if (current > 0) {
          triggerAnimation(current);
        } else if (current === 0) {
          triggerAnimation("YA!");
        } else {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          // Ocultar el componente después de un momento
          setTimeout(() => setCount(null), 800);
        }
      }, 1000);
    };

    socket.on("start_countdown", handleCountdown);

    return () => {
      socket.off("start_countdown", handleCountdown);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [socket, playCountdown]);

  if (count === null) return null;

  /**
   * Determina el color del texto según el valor del contador.
   */
  const getTextColor = () => {
    if (count === "YA!") return "#16a34a"; // Verde
    if (count === 1) return "#ca8a04"; // Amarillo/Naranja
    return "#dc2626"; // Rojo
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none select-none">
      {/* Contenedor Animado */}
      <div
        className={`
            relative flex items-center justify-center 
            w-56 h-56 bg-white rounded-3xl
            border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]
            transition-all duration-150
            ${animate ? "scale-125 rotate-6" : "scale-100 rotate-0"}
         `}
      >
        <span
          className="text-6xl font-['Press_Start_2P']"
          style={{
            color: getTextColor(),
            textShadow: "4px 4px 0px rgba(0,0,0,0.1)",
          }}
        >
          {count}
        </span>
      </div>
    </div>
  );
};

export default RaceCountdown;
