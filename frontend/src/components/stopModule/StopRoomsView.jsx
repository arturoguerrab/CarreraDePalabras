import React from "react";
import { Link } from "react-router-dom";

const StopRoomsView = ({
  roomToJoin,
  handleRoomToJoinChange,
  handleCreateRoom,
  handleJoinRoom,
}) => {
  return (
    <div>
      <h3>Elige una opción</h3>
      <button className="bg-amber-300 " onClick={handleCreateRoom}>
        Crear Sala Nueva
      </button>
      <hr style={{ margin: "20px 0" }} />
      <form onSubmit={handleJoinRoom}>
        <input
          type="text"
          value={roomToJoin}
          onChange={handleRoomToJoinChange}
          placeholder="Introduce el ID de la sala"
        />
        <button className="bg-green-300" type="submit">
          Unirse a Sala
        </button>
      </form>
    </div>
  );
};

export default StopRoomsView;
