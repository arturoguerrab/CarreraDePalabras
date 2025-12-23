import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { StopContext } from "../../context/StopContext.jsx";

const LobbyMenu = () => {
	const { logout, user } = useContext(StopContext);

	// Prioridad de visualización: Username > Nombre > Email
	const displayName = user?.username || user?.firstName || user?.email;
	const handwritingStyle = { fontFamily: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", sans-serif' };

	return (
		<div className="min-h-screen bg-[#d6c096] flex items-center justify-center px-4 py-12 font-sans relative overflow-hidden">
			{/* Textura de madera (patrón CSS simple) */}
			<div className="absolute inset-0 opacity-30" style={{
				backgroundImage: 'repeating-linear-gradient(45deg, #bfa376 25%, transparent 25%, transparent 75%, #bfa376 75%, #bfa376), repeating-linear-gradient(45deg, #bfa376 25%, #d6c096 25%, #d6c096 75%, #bfa376 75%, #bfa376)',
				backgroundPosition: '0 0, 10px 10px',
				backgroundSize: '20px 20px'
			}}></div>

			<div className="w-full max-w-md relative z-10">
				{/* Tablero del Clipboard */}
				<div className="bg-[#5d4037] rounded-3xl p-3 shadow-2xl relative">
					
					{/* Clip Metálico (Parte superior) */}
					<div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-32 h-16 z-20">
						<div className="w-full h-full bg-gradient-to-b from-gray-300 to-gray-400 rounded-lg shadow-lg border-t-4 border-gray-500 flex items-center justify-center">
							{/* Detalle del resorte */}
							<div className="w-24 h-8 bg-black/10 rounded-full border-b border-white/50"></div>
						</div>
					</div>

					{/* Hoja de Papel */}
					<div className="bg-white h-[550px] rounded-lg shadow-md relative overflow-hidden pt-16 px-8 pb-8"
						 style={{
							 backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)',
							 backgroundSize: '100% 2rem',
							 lineHeight: '2rem'
						 }}>
						
						{/* Contenido */}
						<div className="relative z-10 h-full flex flex-col">
							<div className="text-center mb-8">
								<div className="inline-block border-4 border-double border-slate-800 px-6 py-2 transform -rotate-1 mb-4">
									<h1 className="text-4xl font-bold text-slate-800 uppercase tracking-widest" style={handwritingStyle}>
										MENÚ
									</h1>
								</div>
								
								<div className="bg-yellow-50 p-4 rounded border border-yellow-200 transform rotate-1 shadow-sm">
									<p className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-1">Jugador Identificado:</p>
									<p className="text-2xl font-bold text-blue-600" style={handwritingStyle}>
										{displayName}
									</p>
								</div>
							</div>

							<div className="space-y-6 mt-4 flex-1 flex flex-col justify-center">
								<Link
									to="/room"
									className="block w-full py-4 bg-blue-100 border-2 border-blue-400 text-blue-800 font-bold text-xl uppercase tracking-widest hover:bg-blue-200 transform transition-all duration-150 hover:-rotate-1 shadow-[3px_3px_0px_rgba(96,165,250,1)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] text-center relative group"
									style={handwritingStyle}
								>
									<span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl group-hover:scale-110 transition-transform">🎮</span>
									Jugar
								</Link>
								
								<button
									onClick={logout}
									className="w-full py-4 bg-red-50 border-2 border-red-300 text-red-700 font-bold text-xl uppercase tracking-widest hover:bg-red-100 transform transition-all duration-150 hover:rotate-1 shadow-[3px_3px_0px_rgba(252,165,165,1)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] relative group"
									style={handwritingStyle}
								>
									<span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl group-hover:scale-110 transition-transform">🚪</span>
									Salir
								</button>
							</div>
							
							<div className="mt-auto text-center opacity-40">
								<p className="text-[10px] font-mono tracking-widest">STOP_GAME_SYSTEM // v1.0</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
export default LobbyMenu;
