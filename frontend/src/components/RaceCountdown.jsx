import React, { useState, useEffect, useContext, useRef } from "react";
import { StopContext } from "../context/StopContext";

const RaceCountdown = () => {
  const { socket } = useContext(StopContext);
  const [count, setCount] = useState(null);
  const [animate, setAnimate] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleCountdown = (seconds) => {
      if (intervalRef.current) clearInterval(intervalRef.current);

      let current = seconds;
      
      const triggerAnimation = (val) => {
        setCount(val);
        setAnimate(true);
        setTimeout(() => setAnimate(false), 300);
      };

      triggerAnimation(current);

      intervalRef.current = setInterval(() => {
        current--;
        if (current > 0) {
          triggerAnimation(current);
        } else if (current === 0) {
          triggerAnimation("GO!");
        } else {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setTimeout(() => setCount(null), 800);
        }
      }, 1000);
    };

    socket.on("start_countdown", handleCountdown);

    return () => {
      socket.off("start_countdown", handleCountdown);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [socket]);

  if (count === null) return null;

  const getColor = () => {
    if (count === "GO!") return "#16a34a"; // Green 600
    if (count === 1) return "#ca8a04"; // Yellow 600
    return "#dc2626"; // Red 600
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
       {/* Círculo de fondo blanco con sombra suave y borde */}
       <div 
         className={`
            relative flex items-center justify-center 
            w-48 h-48 bg-white rounded-2xl
            border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
            transition-transform duration-100
            ${animate ? 'scale-110 rotate-3' : 'scale-100 rotate-0'}
         `}
       >
          {/* Número */}
          <span 
            className="text-6xl font-['Press_Start_2P']"
            style={{ 
              color: getColor(),
              textShadow: '3px 3px 0px rgba(0,0,0,0.2)'
            }}
          >
            {count}
          </span>
       </div>
    </div>
  );
};

export default RaceCountdown;