import React from "react";
import { useParams, useNavigate } from "react-router-dom"; // 1. Importar hooks
import StopMpView from "./StopMpView";
import { useContext } from "react";
import { StopContext } from "../../context/StopContext";
import { useState } from "react";
import { useEffect } from "react";
import GameInputContainer from "../GameInputContainer";
import StopContainer from "../StopContainer";

const StopMpContainer = () => {
	// 2. Usar el hook para obtener un objeto con los parámetros de la URL
	const { roomId: urlRoomId } = useParams(); // Renombramos para evitar conflictos
	const navigate = useNavigate();
	const {
		socket,
		players,
		gameError,
		joinRoom,
		user,
		leaveRoom, // 1. Obtenemos la nueva función del contexto
		roomId: contextRoomId, // El ID de la sala en el contexto
		gameState,
		startGame,
		gameResults,
		gameScores,
		isGameOver,
		roundInfo,
		nextRound,
		resetGame,
		backToLobby,
	} = useContext(StopContext);

	const isOwner = players.length > 0 && user?.email === players[0].email;

	useEffect(() => {
		// Si tenemos los datos necesarios (socket, usuario y un ID de sala en la URL), nos unimos.
		// Esto se ejecutará tanto en la navegación inicial como al refrescar la página.
		if (socket && user && urlRoomId) {
			joinRoom(urlRoomId);
		}

		// 2. Función de limpieza que se ejecuta al desmontar el componente
		return () => {
			console.log(`Saliendo de la sala ${urlRoomId}`);
			leaveRoom(urlRoomId);
		};
	}, [socket, user, urlRoomId]); // Simplificamos las dependencias

	const handleLeave = () => {
		navigate("/"); // Al navegar fuera, el useEffect de limpieza se encargará de sacarlo de la sala
	};

	if (gameState === "playing") {
		return <GameInputContainer />;
	}

	if (gameState === "calculating") {
		// Si ocurre un error durante el cálculo, lo mostramos en lugar del loading
		if (gameError) {
			return <StopContainer loading={false} error={gameError} onLeave={handleLeave} />;
		}
		return <StopContainer loading={true} />;
	}

	if (gameState === "results") {
		return <StopContainer 
			entradaDatos={gameResults} 
			onPlayAgain={() => {
				if (isOwner) {
					resetGame(urlRoomId);
				} else {
					backToLobby();
				}
			}}
			onNextRound={() => nextRound(urlRoomId)}
			onLeave={handleLeave}
			error={gameError}
			scores={gameScores}
			isGameOver={isGameOver}
			roundInfo={roundInfo}
			isOwner={isOwner}
		/>;
	}

	if (gameError) {
		return (
			<div className="min-h-screen bg-[#6366f1] flex items-center justify-center px-4 py-12 font-['Press_Start_2P'] relative overflow-hidden">
				{/* Fondo Cuadriculado */}
				<div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>

				{/* Decoración */}
				<div className="absolute top-10 right-10 w-16 h-16 bg-[#ef4444] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transform rotate-45"></div>
				<div className="absolute bottom-10 left-10 w-20 h-8 bg-[#60a5fa] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transform -rotate-3"></div>

				<div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] rounded-3xl p-8 max-w-md w-full text-center relative z-10">
					<div className="text-8xl mb-6">🚫</div>
					<h2 className="text-lg text-black mb-4 uppercase leading-relaxed">No puedes entrar</h2>
					<p className="text-xs text-gray-500 mb-8 uppercase leading-relaxed">{gameError}</p>
					<button
						onClick={handleLeave}
						className="w-full py-4 bg-[#ef4444] border-4 border-black text-white text-xs uppercase hover:bg-red-500 rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
					>
						<span className="text-xl mr-2">🏠</span> Volver al Inicio
					</button>
				</div>
			</div>
		);
	}

	return (
		<StopMpView
			isConnected={socket?.connected} // Pasamos si el socket está conectado
			userEmail={user?.email} // Pasamos el email del usuario
			roomId={urlRoomId} // Usamos el ID de la URL para mostrarlo
			players={players} // Pasamos la lista de jugadores del contexto
			handleStartGame={(rounds) => startGame(urlRoomId, rounds)}
			handleLeave={handleLeave}
		/>
	);
};

export default StopMpContainer;