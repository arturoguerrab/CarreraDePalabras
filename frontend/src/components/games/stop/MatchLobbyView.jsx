import React, { useState } from "react";

/**
 * STOP MP VIEW
 * Renderiza la sala de espera de una partida de Stop.
 */
const MatchLobbyView = ({
	isConnected,
	userEmail,
	roomId,
	players,
	handleToggleReady,
	handleStartGame,
	handleLeave,
	countdown,
}) => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [rounds, setRounds] = useState(5);

	// Owner Logic: First player in the list is the Admin
	const owner = players.length > 0 ? players[0] : null;
	const isOwner = userEmail && owner && owner.email === userEmail;
	const me = players.find((p) => p.email === userEmail);
	const isReady = me?.ready || false;

	const onToggle = () => {
		if (isSubmitting || (countdown && countdown > 0)) return;
		setIsSubmitting(true);

		if (isOwner && !isReady) {
			handleStartGame(Number(rounds));
		}

		handleToggleReady();

		// Re-enable after a short delay for safety
		setTimeout(() => setIsSubmitting(false), 500);
	};

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

			{/* Decoración Retro */}
			<div className="absolute top-10 right-10 w-16 h-16 bg-retro-red border-4 border-black shadow-retro-sm transform rotate-45"></div>
			<div className="absolute bottom-10 left-10 w-20 h-8 bg-retro-blue-light border-4 border-black shadow-retro-sm transform -rotate-3"></div>

			<div className="w-full max-w-2xl relative z-10">
				<div className="bg-white border-4 border-black shadow-retro rounded-3xl p-8 relative">
					{/* Cabecera de la Sala */}
					<header className="text-center mb-8">
						<div className="inline-block bg-yellow-100 border-4 border-black px-4 py-2 rounded-xl mb-4 shadow-sm">
							<h1 className="text-sm text-black uppercase tracking-wider">
								SALA: {roomId}
							</h1>
						</div>
						<div className="flex justify-center items-center gap-2">
							<div
								className={`w-3 h-3 border-2 border-black rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
							></div>
							<p className="text-[10px] text-gray-400 uppercase tracking-tighter">
								{isConnected ? "En línea" : "Desconectado"}
							</p>
						</div>
					</header>

					{/* Lista de Jugadores */}
					<section className="mb-8">
						{/* Configuración de Sala (Solo Owner) */}
						{isOwner && !isReady && !countdown && (
							<div className="mb-6 p-4 bg-yellow-50 border-2 border-dashed border-yellow-400 rounded-2xl">
								<label className="block text-[10px] text-gray-500 uppercase font-bold mb-2">
									Rondas a Jugar:
								</label>
								<div className="flex justify-center gap-2">
									{[3, 5, 10].map((r) => (
										<button
											key={r}
											onClick={() => setRounds(r)}
											className={`px-4 py-2 text-[10px] border-2 rounded-xl transition-all font-bold ${rounds === r ? "bg-black text-white border-black transform scale-105" : "bg-white text-gray-500 border-gray-300 hover:border-black"}`}
										>
											{r}
										</button>
									))}
								</div>
							</div>
						)}

						<h3 className="text-[10px] text-gray-400 mb-4 border-b-2 border-gray-100 pb-2 uppercase tracking-widest leading-loose">
							Jugadores ({players.length})
						</h3>
						<ul className="space-y-4">
							{players.map((player, index) => (
								<li
									key={player.email}
									className={`flex items-center gap-2 md:gap-4 text-xs p-3 md:p-4 border-4 rounded-2xl transition-all ${player.ready ? "bg-green-50 border-green-500 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.2)]" : "bg-gray-50 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]"}`}
								>
									<div
										className={`w-7 h-7 md:w-8 md:h-8 shrink-0 flex items-center justify-center rounded-lg border-2 border-black font-bold ${player.ready ? "bg-green-400 text-white" : "bg-white text-gray-400"}`}
									>
										{player.ready ? "✓" : index + 1}
									</div>

									<div className="flex flex-col md:flex-row md:items-center justify-between grow gap-2 min-w-0">
										<div className="flex items-center gap-2 min-w-0">
											<span
												className={`truncate uppercase ${player.email === userEmail ? "text-black font-bold underline decoration-wavy" : "text-gray-600"}`}
											>
												{player.displayName}
											</span>
											{index === 0 && (
												<span
													className="text-base shrink-0 -mt-3"
													title="Administrador de Sala"
												>
													👑
												</span>
											)}
										</div>

										<div className="flex items-center gap-1 md:gap-2 shrink-0">
											{player.ready ? (
												<span className="text-[7px] md:text-[8px] bg-green-500 text-white px-2 md:px-3 py-1 rounded-full border-2 border-black uppercase font-bold animate-bounce whitespace-nowrap">
													LISTO
												</span>
											) : (
												<span className="text-[7px] md:text-[8px] bg-gray-200 text-gray-500 px-2 md:px-3 py-1 rounded-full border-2 border-dashed border-gray-400 uppercase font-bold whitespace-nowrap">
													ESPERANDO
												</span>
											)}

											{player.email === userEmail && (
												<span className="text-[7px] md:text-[8px] bg-blue-500 text-white px-1.5 md:px-2 py-1 rounded border-2 border-black uppercase font-bold whitespace-nowrap">
													TÚ
												</span>
											)}
										</div>
									</div>
								</li>
							))}
						</ul>
					</section>

					<footer className="border-t-4 border-black pt-8 space-y-4">
						<button
							onClick={onToggle}
							disabled={isSubmitting || (countdown && countdown > 0)}
							className={`w-full py-5 border-4 border-black text-white text-[10px] uppercase rounded-2xl shadow-retro hover:translate-y-1 hover:shadow-retro-sm transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed ${isReady ? "bg-retro-red hover:bg-red-500" : "bg-retro-green-dark hover:bg-green-500"}`}
						>
							{countdown && countdown > 0 ? (
								<>{countdown}...</>
							) : isReady ? (
								<>CANCELAR LISTO</>
							) : (
								<>{isOwner ? `EMPEZAR (${rounds} Rondas)` : "MARCAR LISTO"}</>
							)}
						</button>

						<button
							onClick={handleLeave}
							disabled={countdown && countdown > 0}
							className="w-full py-5 bg-white border-4 border-black text-black text-[10px] uppercase hover:bg-gray-100 rounded-2xl shadow-retro hover:translate-y-1 hover:shadow-retro-sm transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Salir de la Sala
						</button>

						<p className="text-center text-[8px] text-gray-400 uppercase tracking-tighter pt-4">
							La partida empezará cuando todos estén listos.
						</p>
					</footer>
				</div>
			</div>
		</div>
	);
};

export default MatchLobbyView;
