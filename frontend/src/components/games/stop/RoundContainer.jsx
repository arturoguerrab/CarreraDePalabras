import React, { useState, useEffect, useRef } from "react";
import { useGame } from "../../../context/GameContext";
import { useSocket } from "../../../context/SocketContext";
import { useRoom } from "../../../context/RoomContext";
import RoundView from "./RoundView";

/**
 * ROUND CONTAINER
 * Gestiona el estado local de las respuestas del jugador durante la ronda.
 */
const RoundContainer = () => {
	const {
		gameLetter,
		gameCategories,
		stoppedBy,
		roundDuration,
		notifyStopPressedByMe,
	} = useGame();
	const { roomId } = useRoom();
	const { socket } = useSocket();

	// Referencia para almacenar las respuestas sin provocar rerenders al escribir
	const answersRef = useRef({});

	// Clave única para el almacenamiento local basada en sala y letra
	const storageKey =
		roomId && gameLetter ? `stop_draft_${roomId}_${gameLetter}` : null;

	// Cargar valores iniciales del localStorage síncronamente (para evitar FOUC de inputs vacíos)
	const initialValues = React.useMemo(() => {
		if (!storageKey) return {};
		try {
			const saved = localStorage.getItem(storageKey);
			return saved ? JSON.parse(saved) : {};
		} catch (error) {
			console.error("Error reading from localStorage", error);
			return {};
		}
	}, [storageKey]);

	// Sincronizar la referencia con los valores cargados (solo al cambiar de letra/sala)
	useEffect(() => {
		answersRef.current = { ...initialValues };
	}, [initialValues]);

	// Estado para bloquear múltiples envíos
	const [isSubmitting, setIsSubmitting] = useState(false);

	/**
	 * Envía las respuestas al servidor.
	 * @param {boolean} isStopTrigger - Indica si el envío fue provocado por el botón "STOP" (termina la ronda para todos).
	 */
	const sendData = (isStopTrigger = false) => {
		if (isSubmitting || !socket) return;
		setIsSubmitting(true);

		// Limpiar el borrador al enviar
		if (storageKey) {
			localStorage.removeItem(storageKey);
		}

		const payload = {
			roomId,
			answers: answersRef.current,
		};

		if (isStopTrigger) {
			socket.emit("stop_round", payload);
		} else {
			socket.emit("submit_answers", payload);
		}
	};

	useEffect(() => {
		// Scroll to top on mobile/small screens when round starts
		window.scrollTo(0, 0);
	}, []);

	useEffect(() => {
		if (!socket) return;

		// Escuchar si la ronda termina forzosamente (ej. otro jugador presionó STOP o se acabó el tiempo)
		const handleForceSubmit = () => {
			sendData(false);
		};

		socket.on("force_submit", handleForceSubmit);

		return () => {
			socket.off("force_submit", handleForceSubmit);
		};
	}, [socket, roomId, storageKey]);

	/**
	 * Maneja el envío voluntario de respuestas (Botón STOP).
	 */
	const handleSubmit = (e) => {
		if (e) e.preventDefault();
		// Optimistic update: Show notification immediately for the stopper
		notifyStopPressedByMe();
		sendData(true);
	};

	/**
	 * Actualiza el valor de una categoría en la referencia de respuestas.
	 */
	const handleInputChange = (category, value) => {
		answersRef.current[category] = value;
		// Guardar en localStorage
		if (storageKey) {
			localStorage.setItem(storageKey, JSON.stringify(answersRef.current));
		}
	};

	return (
		<RoundView
			key={storageKey}
			handleSubmit={handleSubmit}
			handleInputChange={handleInputChange}
			letra={gameLetter}
			categories={gameCategories}
			isSubmitting={isSubmitting}
			stoppedBy={stoppedBy}
			roundDuration={roundDuration}
			initialValues={initialValues}
		/>
	);
};

export default RoundContainer;
