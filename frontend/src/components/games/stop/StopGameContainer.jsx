import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useSocket } from "../../../context/SocketContext";
import { useGame } from "../../../context/GameContext";
import { useSound } from "../../../context/SoundContext";

import { useRoom } from "../../../context/RoomContext";

import MatchLobbyView from "./MatchLobbyView";
import RoundContainer from "./RoundContainer";
import ResultsView from "./ResultsView";
import ConfirmationModalView from "../../common/ConfirmationModalView";

/**
 * Organiza el flujo de la sala de espera (Lobby de partida) y selecciona
 * qué vista mostrar según el estado del juego (jugando, calculando o resultados).
 */
const StopGameContainer = () => {
	const { roomId: urlRoomId } = useParams();
	const navigate = useNavigate();
	const [showExitModal, setShowExitModal] = useState(false);

	const { user } = useAuth();
	const { socket } = useSocket();
	const { playStopAlarm } = useSound();

	// Room Context
	const { joinRoom, leaveRoom, players, toggleReady, roomError } = useRoom();

	// Game Context
	const {
		gameError,
		gameState,
		gameResults,
		gameScores,
		isGameOver,
		roundInfo,
		resetGame,
		countdown,
		stoppedBy,
		startGame,
		backToLobby,
	} = useGame();

	const combinedError = gameError || roomError;

	useEffect(() => {
		// Intento de unión automática al entrar o refrescar
		if (socket && user && urlRoomId) {
			joinRoom(urlRoomId);
		}

		// Limpieza al desmontar: salir de la sala en el servidor
		return () => {
			if (urlRoomId) {
				leaveRoom(urlRoomId);
			}
		};
	}, [socket, user, urlRoomId, joinRoom, leaveRoom]);

	// Navega de vuelta al menú principal tras confirmación.
	const handleLeave = () => {
		setShowExitModal(true);
	};

	const confirmLeave = () => {
		setShowExitModal(false);
		navigate("/lobby");
	};

	/**
	 * LÓGICA DE RENDERIZADO POR ESTADO
	 */

	/**
	 * ESTADO DE NOTIFICACIÓN DE STOP
	 * Muestra un aviso cuando alguien detiene la ronda, visible sobre cualquier vista
	 */
	const [showStopNotification, setShowStopNotification] = useState(false);
	const [canCloseNotification, setCanCloseNotification] = useState(false);
	const [hasShownNotification, setHasShownNotification] = useState(false);

	useEffect(() => {
		if (!stoppedBy) {
			setHasShownNotification(false);
		}
	}, [stoppedBy]);

	useEffect(() => {
		if (
			stoppedBy &&
			gameState !== "lobby" &&
			!showStopNotification &&
			!hasShownNotification
		) {
			setShowStopNotification(true);
			setHasShownNotification(true);
			setCanCloseNotification(false);

			// Play Alarm Sound
			playStopAlarm();
		}
	}, [
		stoppedBy,
		gameState,
		showStopNotification,
		hasShownNotification,
		playStopAlarm,
	]);

	// Manejo del temporizador de la notificación
	useEffect(() => {
		if (showStopNotification) {
			setCanCloseNotification(false);

			const timer = setTimeout(() => {
				setCanCloseNotification(true);
			}, 3000);

			return () => {
				clearTimeout(timer);
			};
		} else {
			// Reset cuando se cierra la notificación
			setCanCloseNotification(false);
		}
	}, [showStopNotification]);

	// Manejo del cierre de la notificación
	useEffect(() => {
		if (!showStopNotification) return;

		// Cierre inmediato
		if (gameState === "lobby" || !stoppedBy) {
			setShowStopNotification(false);
			return;
		}

		// Cierre normal
		if (canCloseNotification) {
			const isStillProcessing =
				gameState === "playing" || gameState === "calculating";

			if (!isStillProcessing || gameError) {
				setShowStopNotification(false);
			}
		}
	}, [
		stoppedBy,
		gameState,
		canCloseNotification,
		showStopNotification,
		gameError,
	]);

	return (
		<>
			{/* Notificación Global de STOP (Pantalla Completa) */}
			{showStopNotification && stoppedBy && (
				<div className="fixed inset-0 z-100 flex items-center justify-center animate-in fade-in duration-300 pointer-events-auto">
					{/* Backdrop con Blur */}
					<div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

					{/* Cartel Vibrante */}
					<div className="relative animate-in zoom-in-50 duration-500 w-11/12 max-w-lg">
						<div className="bg-retro-yellow border-[6px] border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-8 md:p-12 text-center transform -rotate-2">
							{/* Decoraciones */}
							<div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-retro-red text-white border-4 border-black px-6 py-2 text-xs md:text-sm uppercase font-extrabold shadow-retro-sm tracking-widest whitespace-nowrap rotate-1">
								RONDA DETENIDA
							</div>

							<div className="flex flex-col items-center gap-6 mt-4">
								<div className="text-6xl md:text-7xl filter drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] animate-bounce">
									⚡
								</div>

								<div className="space-y-4">
									<p className="text-black text-xs uppercase font-bold tracking-widest">
										EL JUGADOR
									</p>
									<h3 className="text-black text-2xl md:text-4xl uppercase font-black tracking-tighter leading-tight bg-white border-4 border-black px-4 py-2 transform rotate-1 inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
										{stoppedBy}
									</h3>
									<p className="text-retro-red text-sm md:text-base uppercase font-black tracking-widest pt-2">
										¡HA PRESIONADO STOP!
									</p>
								</div>
							</div>

							<div className="mt-8 text-[10px] text-gray-600 uppercase font-bold animate-pulse">
								Calculando resultados...
							</div>
						</div>
					</div>
				</div>
			)}
			{/* 1. Durante la ronda activa y calculando (inputs congelados detrás de la notificación) */}
			{(gameState === "playing" || gameState === "calculating") && (
				<RoundContainer />
			)}

			{/* 2. Mientras la IA o el Servidor procesan resultados (SOLO SI HAY ERROR) */}
			{/* Si no hay error, no mostramos el loader aburrido porque ya tenemos la notificación de STOP superpuesta */}
			{gameState === "calculating" && combinedError && (
				<ResultsView
					loading={false}
					error={combinedError}
					onLeave={handleLeave}
				/>
			)}

			{/* 3. Pantalla de resultados de ronda o fin de juego */}
			{gameState === "results" && (
				<ResultsView
					visual={gameResults || []} // Remapped prop name
					loading={false}
					entradaDatos={gameResults} // Legacy prop support
					onPlayAgain={backToLobby}
					onNextRound={() => toggleReady(urlRoomId)}
					onLeave={handleLeave}
					error={combinedError}
					scores={gameScores}
					isGameOver={isGameOver}
					roundInfo={roundInfo}
					players={players}
					userEmail={user?.email}
					countdown={countdown}
					stoppedBy={stoppedBy}
					roomId={urlRoomId}
				/>
			)}

			{/* 4. Manejo de error crítico (ej. sala llena, inexistente o partida iniciada) */}
			{combinedError &&
				!["playing", "calculating", "results"].includes(gameState) && (
					<div className="min-h-screen bg-retro-bg flex items-center justify-center px-4 py-12 font-arcade relative overflow-hidden">
						<div
							className="absolute inset-0 opacity-10"
							style={{
								backgroundImage:
									"linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)",
								backgroundSize: "40px 40px",
							}}
						></div>
						<div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] rounded-3xl p-10 max-w-lg w-full text-center relative z-10">
							<div className="text-8xl mb-8">🚫</div>
							<h2 className="text-base text-black mb-6 uppercase font-bold">
								Sin Acceso
							</h2>
							<p className="text-[10px] text-gray-400 mb-10 uppercase leading-loose tracking-widest">
								{combinedError}
							</p>
							<button
								onClick={() => navigate("/lobby")}
								className="w-full py-5 bg-retro-red border-4 border-black text-white text-[10px] uppercase hover:bg-red-500 rounded-2xl shadow-retro hover:translate-y-1 hover:shadow-retro-sm transition-all font-bold"
							>
								Volver al Menú
							</button>
						</div>
					</div>
				)}

			{/* 5. Sala de Espera / Lobby (Vista por defecto si no hay errores ni otros estados) */}
			{!["playing", "calculating", "results"].includes(gameState) &&
				!combinedError && (
					<MatchLobbyView
						isConnected={socket?.connected}
						userEmail={user?.email}
						roomId={urlRoomId}
						players={players}
						handleToggleReady={() => toggleReady(urlRoomId)}
						handleStartGame={(rounds) => startGame(urlRoomId, rounds)}
						handleLeave={handleLeave}
						countdown={countdown}
					/>
				)}

			{/* Modal de Confirmación Global */}
			<ConfirmationModalView
				isOpen={showExitModal}
				onConfirm={confirmLeave}
				onCancel={() => setShowExitModal(false)}
				message="Si sales ahora perderás tu progreso en esta sala. ¿Quieres continuar?"
			/>
		</>
	);
};

export default StopGameContainer;
