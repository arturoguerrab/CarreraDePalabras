import React, { useContext } from "react";
import { Link } from "react-router-dom";
import {StopContext} from "../../context/StopContext.jsx";

const lobbyMenu = () => {
  const { logout } = useContext(StopContext);
	return (
		<>
			<Link to="/play" className="text-blue-600 hover:underline font-medium">
				Jugar Solo
			</Link>
			<button onClick={logout}>logout
      </button>
		</>
	);
};
export default lobbyMenu;
