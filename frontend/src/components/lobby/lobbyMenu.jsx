import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { StopContext } from "../../context/StopContext.jsx";

const lobbyMenu = () => {
	const { logout, user } = useContext(StopContext);
	console.log(user)
	return (
		<>
			<h1 className="text-2xl font-bold mb-4">Bienvenido al Lobby, {user.email + " " + user.id}!</h1>
			<Link to="/play" className="text-white text-lg px-4 py-2 rounded-lg m-4 bg-blue-600 hover:underline font-medium">
				Jugar Solo
			</Link>
			<button className="text-white text-lg px-4 py-2 rounded-lg m-4 bg-red-600 hover:underline font-medium" onClick={logout}>Cerrar Sesion</button>
			<Link to="/socket" className="text-white text-lg px-4 py-2 rounded-lg m-4 bg-blue-600 hover:underline font-medium">
				Unirse al chat
			</Link>
		</>
	);
};
export default lobbyMenu;
