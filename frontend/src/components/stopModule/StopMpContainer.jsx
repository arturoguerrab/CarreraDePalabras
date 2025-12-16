import React from "react";
import { useParams } from "react-router-dom"; // 1. Importar el hook
import StopMpView from "./StopMpView";
import { useContext } from "react";
import { StopContext } from "../../context/StopContext";
import { useState } from "react";
import { useEffect } from "react";

const StopMpContainer = () => {
	// 2. Usar el hook para obtener un objeto con los parámetros de la URL
	const { roomId: urlRoomId } = useParams(); // Renombramos para evitar conflictos
	const {
		socket,
		players,
		gameError,
		joinRoom,
		user,
		leaveRoom, // 1. Obtenemos la nueva función del contexto
		roomId: contextRoomId, // El ID de la sala en el contexto
	} = useContext(StopContext);

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

	return (
		<StopMpView
			isConnected={socket?.connected} // Pasamos si el socket está conectado
			userEmail={user?.email} // Pasamos el email del usuario
			roomId={urlRoomId} // Usamos el ID de la URL para mostrarlo
			players={players} // Pasamos la lista de jugadores del contexto
		/>
	);
};

export default StopMpContainer;