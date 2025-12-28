import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import GameInputContainer from "./components/GameInputContainer.jsx";
import StopContextProvider from "./context/StopContext.jsx";
import RegisterContainer from "./components/auth/RegisterContainer.jsx";
import LoginContainer from "./components/auth/LoginContainer.jsx";
import Lobby from "./components/lobby/LobbyMenu.jsx";
import ValidateSession from "./components/auth/ValidateSession.jsx";
import StopRoomsContainer from "./components/stopModule/StopRoomsContainer.jsx";
import StopMpContainer from "./components/stopModule/StopMpContainer.jsx";
import RaceCountdown from "./components/RaceCountdown.jsx";
import NotFoundView from "./components/NotFoundView.jsx";

function App() {
  return (
    <BrowserRouter>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}</style>
      <StopContextProvider>
        <RaceCountdown />
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/registro" element={<RegisterContainer />} />
          <Route path="/login" element={<LoginContainer />} />

          {/* Rutas Protegidas */}
          <Route element={<ValidateSession />}>
            <Route path="/" element={<Navigate to="/lobby" replace />} />
            <Route path="/play" element={<GameInputContainer />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/room" element={<StopRoomsContainer />} />
            <Route path="/room/:roomId" element={<StopMpContainer />} />
          </Route>

          {/* Ruta para páginas no encontradas */}
          <Route
            path="*"
            element={<NotFoundView />}
          />
        </Routes>
      </StopContextProvider>
    </BrowserRouter>
  );
}

export default App;
