import React from "react";
import {Link} from "react-router-dom";

const lobbyMenu = () => {
  return (
            
            <Link
                to="/play"
                className="text-blue-600 hover:underline font-medium"
            >Jugar Solo
            </Link>
  );
};
export default lobbyMenu;
