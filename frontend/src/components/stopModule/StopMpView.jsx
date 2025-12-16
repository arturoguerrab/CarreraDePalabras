import React from "react";
import { Link } from "react-router-dom";

const StopMpView = ({
  isConnected,
  userEmail,
  roomId,
  players,
}) => {
  return (
    <div>
      <h2>Lobby del Juego "Stop"</h2>
      <p>
        Estado de Conexión:{" "}
        <strong>{isConnected ? "✅ Conectado" : "⏳ Desconectado"}</strong>
      </p>
      {userEmail && (
        <p>
          Jugador: <strong>{userEmail}</strong>
        </p>
      )}

      <hr style={{ margin: "20px 0" }} />

      <div>
        <h3>Estás en la sala: {roomId}</h3>
        <h4>Jugadores Conectados:</h4>
        <ul>
          {players.map((playerEmail) => (
            <li key={playerEmail}>
              {playerEmail === userEmail ? `${playerEmail} (Tú)` : playerEmail}
            </li>
          ))}
        </ul>
        {/* Aquí iría la lógica del juego: botones de "Stop", inputs, etc. */}
        <Link
          to={`/room/${roomId}`}
          className="text-white text-lg px-4 py-2 rounded-lg m-4 bg-blue-600 hover:underline font-medium"
        >
          Empezar partida
        </Link>
      </div>
    </div>
  );
};

export default StopMpView;
