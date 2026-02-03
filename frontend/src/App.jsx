import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

// Core / Context
import { AuthContextProvider } from "./context/AuthContext.jsx";
import { SocketContextProvider } from "./context/SocketContext.jsx";
import { RoomContextProvider } from "./context/RoomContext.jsx";
import { GameContextProvider } from "./context/GameContext.jsx";
import { SoundContextProvider } from "./context/SoundContext.jsx";

import ValidateSession from "./components/auth/ValidateSession.jsx";
import RaceCountdown from "./components/common/RaceCountdown.jsx";
import NotFoundView from "./components/common/NotFoundView.jsx";

// Pages
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import LobbyPage from "./pages/LobbyPage.jsx";
import GameRoomPage from "./pages/GameRoomPage.jsx";
import RoomsListPage from "./pages/RoomsListPage.jsx";

function App() {
	return (
		<BrowserRouter>
			<AuthContextProvider>
				<SocketContextProvider>
					<RoomContextProvider>
						<GameContextProvider>
							<SoundContextProvider>
								{/* Componente global para la cuenta regresiva antes de empezar */}
								<RaceCountdown />

								<Routes>
									{/* Rutas Públicas */}
									<Route path="/registro" element={<RegisterPage />} />
									<Route path="/login" element={<LoginPage />} />

									{/* Rutas Protegidas (Requieren sesión activa) */}
									<Route element={<ValidateSession />}>
										<Route
											path="/"
											element={<Navigate to="/lobby" replace />}
										/>
										<Route path="/lobby" element={<LobbyPage />} />
										<Route path="/room" element={<RoomsListPage />} />
										<Route path="/room/:roomId" element={<GameRoomPage />} />
									</Route>

									{/* Manejo de Rutas No Encontradas */}
									<Route path="*" element={<NotFoundView />} />
								</Routes>
							</SoundContextProvider>
						</GameContextProvider>
					</RoomContextProvider>
				</SocketContextProvider>
			</AuthContextProvider>
		</BrowserRouter>
	);
}

export default App;
