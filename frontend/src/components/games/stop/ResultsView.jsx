import React, { useState, useEffect } from "react";
import { useSocket } from "../../../context/SocketContext";
import TrialModal from "./TrialModal";
import ToastNotification from "../../common/ToastNotification";

/**
 * STOP VIEW
 * Renderiza los resultados de cada ronda, el podio final y estados de carga/error.
 */
const ResultsView = ({
	visual,
	loading,
	error,
	onPlayAgain,
	onNextRound,
	onLeave,
	scores,
	isGameOver,
	roundInfo,
	players,
	userEmail,
	countdown,
	stoppedBy,
	roomId,
}) => {
	const { socket } = useSocket();
	const [showFinalScore, setShowFinalScore] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Custom Notification State
	const [toast, setToast] = useState({ message: null, type: "error" });

	// Trial State
	const [isTrialOpen, setIsTrialOpen] = useState(false);
	const [currentTrialData, setCurrentTrialData] = useState(null);
	const [voteStatus, setVoteStatus] = useState(null);
	const [localVisual, setLocalVisual] = useState(visual);

	useEffect(() => {
		setLocalVisual(visual);
	}, [visual]);

	useEffect(() => {
		if (!socket) return;

		const onTrialStarted = (data) => {
			setCurrentTrialData(data);
			setVoteStatus({ voteCount: 0, totalPlayers: players?.length || 0 });
			setIsTrialOpen(true);
		};

		const onVoteUpdate = (data) => {
			setVoteStatus(data);
		};

		const onTrialResolved = (data) => {
			setCurrentTrialData((prev) => ({ ...prev, result: data }));

			// Update local visual state to reflect new validity
			if (data.updatedWordStatus && data.targetPlayerId) {
				setLocalVisual((prevVisual) => {
					return prevVisual.map((block) => {
						if (block.categoria === data.category) {
							return {
								...block,
								respuestas: block.respuestas.map((resp) => {
									// Fairness Logic: Update ALL players with the same word
									const normalize = (s) =>
										s ? s.toString().toLowerCase().trim() : "";
									if (
										// resp.playerId === data.targetPlayerId && // REMOVED to apply to all
										normalize(resp.palabra) === normalize(data.word)
									) {
										const isValid = data.updatedWordStatus === "valid";
										return {
											...resp,
											es_valida: isValid,
											mensaje: isValid
												? "Validada por Juicio"
												: "Invalidada por Juicio",
											puntos: isValid
												? resp.puntos > 0
													? resp.puntos
													: 100 // Visual approximation, real scores on refresh
												: 0,
										};
									}
									return resp;
								}),
							};
						}
						return block;
					});
				});
			}

			// Close modal after delay
			setTimeout(() => {
				setIsTrialOpen(false);
				setCurrentTrialData(null);
				setVoteStatus(null);
			}, 3000);
		};

		const onFinalConsensus = () => {
			setShowFinalScore(true);
		};

		const onError = (data) => {
			console.error("Socket Error:", data);
			setToast({
				message:
					typeof data === "string"
						? data
						: data.message || "Ocurrió un error inesperado",
				type: "error",
			});
		};

		socket.on("trial_started", onTrialStarted);
		socket.on("vote_update", onVoteUpdate);
		socket.on("trial_resolved", onTrialResolved);
		socket.on("final_consensus_reached", onFinalConsensus);
		socket.on("error", onError);

		return () => {
			socket.off("trial_started", onTrialStarted);
			socket.off("vote_update", onVoteUpdate);
			socket.off("trial_resolved", onTrialResolved);
			socket.off("final_consensus_reached", onFinalConsensus);
			socket.off("error", onError);
		};
	}, [socket, players]);

	const handleChallenge = (item, category) => {
		if (!socket) return;

		// 1. Try Direct ID (New Backend Logic)
		let targetId = item.playerId;

		// 2. Fallback: Search by Name (Legacy/Safety)
		if (!targetId) {
			console.log("Searching for player by name:", item.nombre);
			console.log("Available players:", players);

			const normalize = (str) =>
				str ? str.toString().toLowerCase().trim() : "";
			const targetName = normalize(item.nombre);

			const targetPlayer = players.find((p) => {
				return (
					normalize(p.username) === targetName ||
					normalize(p.firstName) === targetName ||
					normalize(p.displayName) === targetName ||
					normalize(p.email) === targetName
				);
			});

			if (targetPlayer) {
				targetId = targetPlayer.id;
				console.log("Player found via fallback:", targetPlayer);
			}
		}

		if (!targetId) {
			console.error("Could not find player ID for challenge", item);
			setToast({
				message: "No se pudo identificar al jugador objetivo.",
				type: "error",
			});
			return;
		}

		socket.emit("start_trial", {
			roomId: roomId,
			targetPlayerId: targetId,
			category: category,
			letter: roundInfo?.letter || "",
			word: item.palabra,
			originalStatus: item.es_valida ? "valid" : "invalid",
		});
	};

	const handleVote = (vote) => {
		if (!socket || !currentTrialData) return;
		socket.emit("vote_trial", {
			roomId: roomId,
			trialId: currentTrialData.trialId, // or newTrial._id from event
			vote,
		});
	};

	const handleReadyClick = () => {
		if (isSubmitting || (countdown && countdown > 0)) return;
		setIsSubmitting(true);
		onNextRound();
		// Reset debounce after a bit
		setTimeout(() => setIsSubmitting(false), 800);
	};

	const handleFinalReadyClick = () => {
		if (isSubmitting) return;
		setIsSubmitting(true);
		if (socket) {
			socket.emit("toggle_ready_final", roomId);
		}
		setTimeout(() => setIsSubmitting(false), 800);
	};

	/**
	 * ESTADO: CARGANDO RESULTADOS
	 */
	if (loading) {
		return (
			<div className="min-h-screen bg-[#6366f1] flex items-center justify-center font-['Press_Start_2P'] relative overflow-hidden">
				<div
					className="absolute inset-0 opacity-10"
					style={{
						backgroundImage:
							"linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)",
						backgroundSize: "40px 40px",
					}}
				></div>
				<div className="text-center z-10">
					<div className="animate-spin text-7xl mb-10 drop-shadow-md">⚙️</div>
					<h2 className="text-lg text-white uppercase drop-shadow-md animate-pulse">
						Procesando respuestas...
					</h2>
				</div>
			</div>
		);
	}

	/**
	 * ESTADO: ERROR
	 */
	if (error) {
		return (
			<div className="min-h-screen bg-[#6366f1] flex items-center justify-center font-['Press_Start_2P'] relative overflow-hidden">
				<div
					className="absolute inset-0 opacity-10"
					style={{
						backgroundImage:
							"linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)",
						backgroundSize: "40px 40px",
					}}
				></div>
				<div className="bg-white border-4 border-black shadow-retro rounded-3xl p-10 max-w-md w-full text-center z-10">
					<div className="text-red-500 text-6xl mb-6">⚠️</div>
					<h3 className="text-base text-black mb-4 uppercase font-bold">
						Error Crítico
					</h3>
					<p className="text-[10px] text-gray-500 leading-loose mb-10 uppercase">
						{error}
					</p>
					<button
						onClick={onLeave}
						className="w-full py-4 bg-retro-red border-4 border-black text-white text-[10px] uppercase hover:bg-red-500 rounded-xl shadow-retro hover:translate-y-1 hover:shadow-retro-sm transition-all"
					>
						Volver al Menú
					</button>
				</div>
			</div>
		);
	}

	// --- VISTA DE GANADOR (FIN DEL JUEGO / PODIO) ---
	if (isGameOver && showFinalScore) {
		const sortedScores = Object.entries(scores || {}).sort(
			(a, b) => b[1] - a[1],
		);
		const winner = sortedScores[0];

		return (
			<div className="min-h-screen bg-retro-yellow flex items-center justify-center font-arcade p-4 relative overflow-hidden">
				<div
					className="absolute inset-0 opacity-10"
					style={{
						backgroundImage: "radial-gradient(#000 2px, transparent 2px)",
						backgroundSize: "20px 20px",
					}}
				></div>

				<div className="bg-white border-4 border-black shadow-retro-lg rounded-[2.5rem] p-10 max-w-lg w-full relative z-10">
					<div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-retro-red border-4 border-black text-white px-8 py-3 rounded-xl shadow-retro-sm text-[10px] uppercase tracking-widest whitespace-nowrap">
						🏆 PODIO FINAL 🏆
					</div>

					<div className="text-center mt-8 mb-10">
						<div className="text-8xl mb-6 drop-shadow-md">👑</div>
						<h2 className="text-lg md:text-xl text-black mb-2 uppercase break-words px-4">
							{winner ? winner[0] : "Nadie"}
						</h2>
						<div className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-lg border-2 border-blue-200 text-xs">
							{winner ? winner[1] : 0} PUNTOS
						</div>
					</div>

					<div className="bg-gray-50 border-4 border-black rounded-2xl p-6 mb-10">
						<h3 className="text-[10px] text-gray-400 mb-6 uppercase border-b-2 border-dashed border-gray-200 pb-3 tracking-widest text-center">
							Clasificación
						</h3>
						<ul className="space-y-5">
							{sortedScores.map(([player, score], index) => (
								<li
									key={player}
									className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-b border-dashed border-gray-100 pb-2"
								>
									<div className="flex items-center gap-3 min-w-0">
										<span
											className={`${index === 0 ? "text-yellow-500 scale-125" : "text-gray-400"} font-bold text-[10px] shrink-0`}
										>
											#{index + 1}
										</span>
										<span className="text-[10px] text-black uppercase truncate">
											{player}
										</span>
									</div>
									<span className="text-[#ef4444] text-[10px] whitespace-nowrap sm:text-right pl-7 md:pl-0">
										{score} PTS
									</span>
								</li>
							))}
						</ul>
					</div>

					<div className="flex flex-col sm:flex-row gap-4">
						<button
							onClick={onPlayAgain}
							className="flex-grow bg-retro-green-dark border-4 border-black text-white text-[10px] py-4 rounded-xl shadow-retro hover:translate-y-1 hover:shadow-none transition-all uppercase"
						>
							Volver a la Sala
						</button>
						<button
							onClick={onLeave}
							className="flex-grow bg-retro-red border-4 border-black text-white text-[10px] py-4 rounded-xl shadow-retro hover:translate-y-1 hover:shadow-none transition-all uppercase"
						>
							Salir
						</button>
					</div>
				</div>
			</div>
		);
	}

	/**
	 * VISTA DE RESULTADOS DE RONDA
	 */
	// User Token Count
	const currentPlayer = players?.find((p) => p.email === userEmail);
	const hasTokens = currentPlayer?.judgmentTokens > 0;

	/**
	 * VISTA DE RESULTADOS DE RONDA
	 */
	return (
		<div className="min-h-screen bg-retro-bg px-4 py-12 font-arcade relative overflow-hidden">
			<TrialModal
				isOpen={isTrialOpen}
				trialData={currentTrialData}
				onVote={handleVote}
				currentUserEmail={userEmail}
				players={players}
				voteStatus={voteStatus}
			/>

			<div
				className="absolute inset-0 opacity-10"
				style={{
					backgroundImage:
						"linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)",
					backgroundSize: "40px 40px",
				}}
			></div>

			<div className="max-w-6xl mx-auto relative z-10">
				{/* Cabecera de Resultados */}
				<header className="text-center mb-12">
					<h1 className="text-3xl text-white mb-6 uppercase drop-shadow-[6px_6px_0px_rgba(0,0,0,0.3)] tracking-tighter">
						RESULTADOS
					</h1>
					{roundInfo && (
						<div className="inline-block bg-yellow-400 border-4 border-black px-6 py-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
							<p className="text-black text-[10px] uppercase font-bold tracking-widest">
								RONDA {roundInfo.current} / {roundInfo.total}
							</p>
						</div>
					)}
				</header>

				{/* Listado por Categorías */}
				<main className="bg-white border-4 border-black shadow-retro-lg rounded-[3rem] p-8 md:p-12 mb-12">
					<div className="space-y-14">
						{localVisual.length > 0 ? (
							localVisual.map((bloque, idx) => (
								<section key={idx}>
									<h2 className="text-xs text-blue-600 mb-6 border-b-4 border-blue-600 inline-block pb-1 uppercase tracking-widest">
										{bloque.categoria}
									</h2>
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
										{bloque.respuestas.map((item, i) => (
											<div
												key={i}
												className={`relative p-5 border-4 rounded-2xl transition-all hover:scale-105 bg-gray-50 flex flex-col justify-between ${item.es_valida ? "border-green-400 shadow-[4px_4px_0px_0px_rgba(72,187,120,0.2)]" : "border-red-400 shadow-[4px_4px_0px_0px_rgba(245,101,101,0.2)]"}`}
											>
												<div>
													<p className="text-[8px] text-gray-400 uppercase mb-3 font-bold tracking-tighter">
														{item.playerId === currentPlayer?.id ||
														item.nombre === currentPlayer?.username ||
														item.nombre === currentPlayer?.firstName ? (
															<span className="text-retro-purple font-black text-[10px]">
																YO
															</span>
														) : (
															item.nombre
														)}
													</p>
													<p className="text-xs text-black mb-3 break-words leading-relaxed">
														{item.palabra || (
															<span className="text-gray-200 italic">
																-- sin respuesta --
															</span>
														)}
													</p>
													<p
														className={`text-[8px] leading-relaxed uppercase ${item.es_valida ? "text-green-500" : "text-red-500"}`}
													>
														{item.mensaje}
													</p>
												</div>

												{/* Insignia de Puntos */}
												<div
													className={`absolute -top-4 -right-4 w-12 h-12 border-4 border-black rounded-full flex items-center justify-center text-white text-xs shadow-md font-bold ${item.es_valida ? "bg-green-500" : "bg-red-500"}`}
												>
													{item.es_valida ? `+${item.puntos}` : "0"}
												</div>

												{/* Stopper Badge */}
												{stoppedBy && item.nombre === stoppedBy && (
													<div className="absolute -top-3 -left-3 transform -rotate-[15deg] z-20">
														<div
															className="bg-retro-yellow text-black text-[8px] border-2 border-black px-2 py-1 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black uppercase tracking-widest animate-pulse cursor-default"
															style={{ animationDuration: "2s" }}
														>
															STOP!
														</div>
													</div>
												)}

												{/* CHALLENGE BUTTON */}
												{/* Only show if: 
													1. Game not over
													2. Not my own word (optional, but safer)
													3. I have tokens
													4. Word is not empty/missing
												*/}
												{item.palabra &&
													!(item.mensaje && item.mensaje.includes("Juicio")) &&
													(() => {
														// Use robust check for "My Word" (ID match OR Name match)
														const isMyWord =
															item.playerId === currentPlayer?.id ||
															item.nombre === currentPlayer?.username ||
															item.nombre === currentPlayer?.firstName;

														// Rule:
														// 1. My word + Invalid -> I can Appeal (Defend)
														// 2. Other's word + Valid -> I can Attack
														const startButton =
															(isMyWord && !item.es_valida) ||
															(!isMyWord && item.es_valida);

														if (!startButton) return null;

														return (
															<button
																onClick={() =>
																	handleChallenge(item, bloque.categoria)
																}
																disabled={!hasTokens}
																className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 
																		text-[8px] uppercase font-bold px-3 py-1 rounded-full border-2 border-black
																		shadow-sm hover:scale-110 transition-transform
																		${hasTokens ? (isMyWord ? "bg-blue-600" : "bg-retro-purple") + " text-white cursor-pointer" : "bg-gray-300 text-gray-500 cursor-not-allowed"}
																	`}
																title={
																	hasTokens
																		? isMyWord
																			? "Apelar invalidación"
																			: "Impugnar esta palabra"
																		: "Sin fichas de juicio"
																}
															>
																⚖️{" "}
																{hasTokens
																	? isMyWord
																		? "Apelar"
																		: "Juicio"
																	: "No Fichas"}
															</button>
														);
													})()}
											</div>
										))}
									</div>
								</section>
							))
						) : (
							<div className="text-center py-20">
								<p className="text-gray-300 text-xs uppercase animate-pulse">
									Esperando datos de la ronda...
								</p>
							</div>
						)}
					</div>

					{/* Acciones de Navegación */}
					<footer className="mt-16 pt-10 border-t-4 border-black flex flex-col items-center gap-8">
						<div className="flex flex-col items-center gap-6 w-full max-w-md">
							{/* Player List - ALWAYS VISIBLE TO SHOW TOKENS */}
							<div className="flex flex-wrap justify-center gap-3">
								{players?.map((p) => (
									<div
										key={p.email}
										className={`flex items-center gap-2 px-3 py-1 rounded-full border-2 border-black ${
											p.ready ? "bg-green-100" : "bg-gray-100"
										}`}
										title={p.displayName}
									>
										<div
											className={`w-2 h-2 rounded-full ${
												p.ready ? "bg-green-500" : "bg-gray-400"
											}`}
										/>
										<span className="text-[10px] font-bold uppercase truncate max-w-[120px]">
											{p.displayName}
										</span>
										{/* Token Counter */}
										<div className="flex items-center gap-1 bg-white px-1.5 rounded border border-black/20">
											<span className="text-[10px]">⚖️</span>
											<span
												className={`text-[10px] font-black ${
													p.judgmentTokens > 0 ? "text-black" : "text-gray-300"
												}`}
											>
												{p.judgmentTokens ?? 3}
											</span>
										</div>
									</div>
								))}
							</div>

							{/* Ready Button - Always Visible to enforce consensus */}
							{!isGameOver ? (
								<>
									<button
										onClick={handleReadyClick}
										disabled={isSubmitting || (countdown && countdown > 0)}
										className={`w-full py-5 px-12 border-4 border-black text-white text-[10px] uppercase rounded-2xl shadow-retro hover:translate-y-1 hover:shadow-retro-sm transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed ${players?.find((p) => p.email === userEmail)?.ready ? "bg-retro-red hover:bg-red-500" : "bg-retro-green-dark hover:bg-green-500"}`}
									>
										{countdown && countdown > 0 ? (
											<>
												<span className="text-xl mr-3 animate-pulse">🔥</span>{" "}
												{countdown}...
											</>
										) : players?.find((p) => p.email === userEmail)?.ready ? (
											"CANCELAR LISTO"
										) : (
											"MARCAR LISTO"
										)}
									</button>

									<p className="text-[8px] text-gray-400 uppercase tracking-tighter text-center">
										Esperando jugadores:{" "}
										{players?.filter((p) => !p.ready).length} /{" "}
										{players?.length}
									</p>
								</>
							) : (
								<>
									<button
										onClick={handleFinalReadyClick}
										disabled={isSubmitting}
										className={`w-full py-5 px-12 border-4 border-black text-white text-[10px] uppercase rounded-2xl shadow-retro hover:translate-y-1 hover:shadow-retro-sm transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed ${players?.find((p) => p.email === userEmail)?.ready ? "bg-retro-red hover:bg-red-500" : "bg-retro-purple hover:bg-purple-500"}`}
									>
										{players?.find((p) => p.email === userEmail)?.ready
											? "CANCELAR FINALIZAR"
											: "IR AL PODIO"}
									</button>
									<p className="text-[8px] text-gray-400 uppercase tracking-tighter text-center">
										Esperando para podio:{" "}
										{players?.filter((p) => !p.ready).length} /{" "}
										{players?.length}
									</p>
								</>
							)}
						</div>

						<div className="flex gap-4">
							<button
								onClick={onLeave}
								disabled={countdown && countdown > 0}
								className="py-4 px-8 bg-white border-4 border-black text-black text-[8px] uppercase hover:bg-gray-100 rounded-xl shadow-retro hover:translate-y-1 hover:shadow-none transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Salir
							</button>
						</div>
					</footer>
				</main>
			</div>
			{/* Toast Notification */}
			<ToastNotification
				message={toast.message}
				type={toast.type}
				onClose={() => setToast({ ...toast, message: null })}
			/>
		</div>
	);
};

export default ResultsView;
