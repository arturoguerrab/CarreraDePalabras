import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

// Core / Context
import StopContextProvider from "./context/StopContext.jsx";
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

/**
 * APP COMPONENT
 * Punto de entrada principal de la aplicación.
 * Define la estructura de rutas y envuelve la app en el proveedor de contexto de Stop.
 */
function App() {
  return (
    <BrowserRouter>
      <StopContextProvider>
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
      </StopContextProvider>
    </BrowserRouter>
  );
}

export default App;
