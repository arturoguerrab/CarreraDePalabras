import { Link } from "react-router-dom";
import PropTypes from "prop-types";

const LobbyView = ({ displayName, muted, toggleMute, logout }) => {
	return (
		<div className="min-h-screen bg-retro-bg flex items-center justify-center px-4 py-12 font-arcade relative overflow-hidden">
			{/* Fondo Cuadriculado */}
			<div
				className="absolute inset-0 opacity-10"
				style={{
					backgroundImage:
						"linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)",
					backgroundSize: "40px 40px",
				}}
			></div>

			{/* Audio Toggle */}
			<div className="absolute top-4 right-4 z-50 flex flex-col gap-2 items-end">
				<button
					onClick={toggleMute}
					className="bg-white border-2 border-black p-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all text-[10px] w-32"
				>
					{muted ? "🔇 SFX OFF" : "🔊 SFX ON"}
				</button>
			</div>

			{/* Decoración: Bloques Arcade */}
			<div className="absolute top-20 left-10 w-16 h-16 bg-retro-green border-4 border-black shadow-retro-sm transform -rotate-12"></div>
			<div className="absolute bottom-20 right-10 w-24 h-8 bg-retro-yellow border-4 border-black shadow-retro-sm transform rotate-6"></div>

			<div className="w-full max-w-md relative z-10">
				{/* Card Principal */}
				<div className="bg-white border-4 border-black shadow-retro rounded-3xl p-8 relative text-center">
					<h1 className="text-2xl text-black mb-8 uppercase drop-shadow-sm">
						MENÚ
					</h1>

					<div className="bg-yellow-100 border-4 border-black p-4 mb-8 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
						<p className="text-xs text-gray-500 mb-2 uppercase">Jugador:</p>
						<p className="text-sm text-blue-600 truncate">{displayName}</p>
					</div>

					<div className="space-y-6">
						<Link
							to="/room"
							className="block w-full py-4 bg-retro-blue border-4 border-black text-white text-sm uppercase hover:bg-blue-400 rounded-xl shadow-retro hover:translate-y-1 hover:shadow-retro-sm transition-all"
						>
							Jugar
						</Link>

						<Link
							to="/profile"
							className="block w-full py-4 bg-retro-pink border-4 border-black text-white text-sm uppercase hover:bg-pink-400 rounded-xl shadow-retro hover:translate-y-1 hover:shadow-retro-sm transition-all"
						>
							Mi Perfil
						</Link>

						<button
							onClick={logout}
							className="w-full py-4 bg-retro-red border-4 border-black text-white text-sm uppercase hover:bg-red-400 rounded-xl shadow-retro hover:translate-y-1 hover:shadow-retro-sm transition-all"
						>
							Salir
						</button>
					</div>

					<div className="mt-8 opacity-40">
						<p className="text-[10px]">v1.0</p>
					</div>
				</div>
			</div>
		</div>
	);
};

LobbyView.propTypes = {
	displayName: PropTypes.string,
	muted: PropTypes.bool.isRequired,
	toggleMute: PropTypes.func.isRequired,
	logout: PropTypes.func.isRequired,
};

export default LobbyView;
