import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

// Core / Context
import { AuthContextProvider } from "./context/AuthContext.jsx";
import { SocketContextProvider } from "./context/SocketContext.jsx";
import { GameContextProvider } from "./context/GameContext.jsx";
import { SoundContextProvider } from "./context/SoundContext.jsx";

import ValidateSession from "./components/auth/ValidateSession.jsx";
import RaceCountdown from "./components/common/RaceCountdown.jsx";
import NotFoundView from "./components/common/NotFoundView.jsx";

// Auth Components
import RegisterContainer from "./components/auth/RegisterContainer.jsx";
import LoginContainer from "./components/auth/LoginContainer.jsx";

// Game Components (Lobby & Module)
import Lobby from "./components/lobby/LobbyMenu.jsx";
import GameInputContainer from "./components/games/stop/GameInputContainer.jsx";
import RoomsContainer from "./components/rooms/RoomsContainer.jsx";
import StopMpContainer from "./components/games/stop/StopMpContainer.jsx";


function App() {
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <SocketContextProvider>
          <GameContextProvider>
            <SoundContextProvider>
              {/* Componente global para la cuenta regresiva antes de empezar */}
              <RaceCountdown />
              
              <Routes>
                {/* --- Rutas Públicas --- */}
                <Route path="/registro" element={<RegisterContainer />} />
                <Route path="/login" element={<LoginContainer />} />

                {/* --- Rutas Protegidas (Requieren sesión activa) --- */}
                <Route element={<ValidateSession />}>
                  <Route path="/" element={<Navigate to="/lobby" replace />} />
                  <Route path="/lobby" element={<Lobby />} />
                  <Route path="/play" element={<GameInputContainer />} />
                  <Route path="/room" element={<RoomsContainer />} />
                  <Route path="/room/:roomId" element={<StopMpContainer />} />
                </Route>

                {/* --- Manejo de Rutas No Encontradas --- */}
                <Route path="*" element={<NotFoundView />} />
              </Routes>
            </SoundContextProvider>
          </GameContextProvider>
        </SocketContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  );
}

export default App;
