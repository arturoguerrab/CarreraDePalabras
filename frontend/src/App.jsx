import Layout from "./components/Layout";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import GameInputContainer from "./components/GameInputContainer.jsx";
import StopContextProvider from "./context/StopContext.jsx";
import GameSocket from "./components/GameSocket.jsx";
import Registro from "./components/registro/Registro.jsx";
import Login from "./components/registro/Login.jsx";
import Lobby from "./components/lobby/lobbyMenu.jsx";
import ValidateSession from "./components/registro/ValidateSession.jsx";

function App() {
  return (
    <BrowserRouter>
      <StopContextProvider>
        <Layout>
          <Routes>

            <Route path="/registro" element={<Registro />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<ValidateSession />} />

            <Route element={<ValidateSession />}>
              <Route path="/game" element={<GameSocket />} />
              <Route path="/play" element={<GameInputContainer />} />
              <Route path="/lobby" element={<Lobby />} />
            </Route>
          </Routes>
        </Layout>
      </StopContextProvider>
    </BrowserRouter>
  );
}

export default App;
