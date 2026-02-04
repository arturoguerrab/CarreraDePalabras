import { useState, useEffect, useRef } from "react";
import { useSocket } from "../../context/SocketContext.jsx";
import { useSound } from "../../context/SoundContext.jsx";
import RaceCountdownView from "./RaceCountdownView.jsx";

/**
 * Componente global que muestra una cuenta regresiva animada antes de iniciar una ronda.
 * Se activa mediante el evento de socket 'start_countdown'.
 */
const RaceCountdownContainer = () => {
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

	return <RaceCountdownView count={count} animate={animate} />;
};

export default RaceCountdownContainer;
