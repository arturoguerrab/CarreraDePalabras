import Layout from "./components/Layout";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import GameInputContainer from "./components/GameInputContainer.jsx";
import StopContextProvider from "./context/StopContext.jsx";
import GameSocket from "./components/GameSocket.jsx";
import RegisterContainer from "./components/auth/RegisterContainer.jsx";
import LoginContainer from "./components/auth/LoginContainer.jsx";
import Lobby from "./components/lobby/lobbyMenu.jsx";
import ValidateSession from "./components/auth/ValidateSession.jsx";

function App() {
	return (
		<BrowserRouter>
			<StopContextProvider>
				<Layout>
					<Routes>
						{/* Rutas Públicas */}
						<Route path="/registro" element={<RegisterContainer />} />
						<Route path="/login" element={<LoginContainer />} />

						{/* Rutas Protegidas */}
						<Route element={<ValidateSession />}>
							<Route path="/" element={<Navigate to="/lobby" replace />} />
							<Route path="/game" element={<GameSocket />} />
							<Route path="/play" element={<GameInputContainer />} />
							<Route path="/lobby" element={<Lobby />} />
						</Route>

						{/* Ruta para páginas no encontradas */}
						<Route
							path="*"
							element={
								<div style={{ textAlign: "center", marginTop: "50px" }}>
									<h1>404: Página No Encontrada</h1>
								</div>
							}
						/>
					</Routes>
				</Layout>
			</StopContextProvider>
		</BrowserRouter>
	);
}

export default App;
