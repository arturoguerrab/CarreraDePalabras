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
			<div className="min-h-screen bg-[#090d18] flex items-center justify-center p-4">
				<div className="bg-[#1e212a] p-8 rounded-2xl shadow-2xl border border-red-500/30 max-w-md w-full text-center">
					<div className="text-5xl mb-4">🚫</div>
					<h2 className="text-2xl font-bold text-white mb-2">No puedes entrar</h2>
					<p className="text-gray-400 mb-8">{gameError}</p>
					<button
						onClick={handleLeave}
						className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105"
					>
						Volver al Inicio
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