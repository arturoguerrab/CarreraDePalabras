import React from "react";

const TrialModal = ({
	isOpen,
	trialData,
	onVote,
	voteStatus,
	currentUserEmail,
	players,
}) => {
	if (!isOpen || !trialData) return null;

	const {
		challengerName,
		word,
		category,
		originalStatus,
		result, // { verdict, challengerWon, ... } if resolved
	} = trialData;

	// Derived states
	const [hasVoted, setHasVoted] = React.useState(false);
	const isResolved = !!result;

	React.useEffect(() => {
		if (isOpen) setHasVoted(false);
	}, [isOpen, trialData]);

	const handleVoteClick = (vote) => {
		setHasVoted(true);
		onVote(vote);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-arcade">
			<div className="bg-white border-4 border-black shadow-retro-lg rounded-3xl w-full max-w-lg overflow-hidden relative animate-bounce-in">
				{/* Header */}
				<div className="bg-retro-purple p-6 border-b-4 border-black text-center">
					<h2 className="text-xl text-white uppercase tracking-widest drop-shadow-md mb-2">
						⚖️ Juicio en Proceso
					</h2>
					<p className="text-[10px] text-white/80 uppercase tracking-tighter">
						{challengerName} ha impugnado una palabra
					</p>
				</div>

				{/* Content */}
				<div className="p-8 text-center bg-retro-bg relative">
					<div className="absolute inset-0 opacity-5 bg-[url('/grid-pattern.png')]"></div>

					<div className="relative z-10 space-y-6">
						{/* Word Info */}
						<div className="bg-white border-4 border-black rounded-2xl p-6 shadow-sm transform -rotate-1">
							<p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">
								Categoría: {category}
							</p>
							<h3 className="text-xl md:text-3xl text-black font-bold uppercase mb-2 break-words">
								{word}
							</h3>
							<div className="flex items-center justify-center gap-2">
								<span className="text-[10px] uppercase">Estado Original:</span>
								<span
									className={`px-3 py-1 text-[8px] border-2 border-black rounded-lg uppercase text-white font-bold ${
										originalStatus === "valid" ? "bg-green-500" : "bg-red-500"
									}`}
								>
									{originalStatus === "valid" ? "Válida" : "Inválida"}
								</span>
							</div>
						</div>

						{isResolved ? (
							<div className="animate-pulse-fast">
								<h3 className="text-xl md:text-2xl mb-4 font-bold uppercase drop-shadow-sm">
									{result.verdict === "tie"
										? "EMPATE"
										: result.verdict === "valid"
											? "¡PALABRA VÁLIDA!"
											: "¡PALABRA INVÁLIDA!"}
								</h3>
								<p
									className={`text-[10px] md:text-sm inline-block px-4 py-2 rounded-lg border-2 font-bold uppercase ${
										result.challengerWon
											? "bg-green-100 text-green-700 border-green-600"
											: "bg-red-100 text-red-700 border-red-600"
									}`}
								>
									{result.challengerWon
										? `${challengerName} ganó el juicio`
										: `${challengerName} perdió el juicio`}
								</p>
							</div>
						) : (
							<div className="space-y-6">
								{/* Actions */}
								<div className="flex justify-center gap-4 relative z-10">
									{/* Determine Context */}
									{(() => {
										const isChallenger =
											currentUserEmail &&
											players?.find((p) => p.email === currentUserEmail)?.id ===
												trialData.challengerId;

										const isAppeal = trialData.originalStatus === "invalid"; // Challenger wants Valid

										// If I am the challenger, I have already voted automatically
										if (isChallenger) {
											return (
												<div className="bg-gray-100 p-4 rounded-xl border-2 border-black text-center">
													<p className="text-xs font-bold uppercase mb-1">
														{isAppeal ? "Has Apelado" : "Has Impugnado"}
													</p>
													<p className="text-[10px] text-gray-500">
														Tu voto automático:{" "}
														<span
															className={`font-black ${isAppeal ? "text-green-600" : "text-red-500"}`}
														>
															{isAppeal ? "VÁLIDA" : "INVÁLIDA"}
														</span>
													</p>
												</div>
											);
										}

										if (hasVoted) {
											return (
												<div className="bg-gray-100 p-4 rounded-xl border-2 border-gray-300">
													<p className="text-xs font-bold uppercase text-gray-500">
														¡Voto registrado!
													</p>
													<p className="text-[10px] text-gray-400 mt-1">
														Esperando veredicto...
													</p>
												</div>
											);
										}

										return (
											<>
												<button
													onClick={() => handleVoteClick("invalid")}
													className="group relative px-6 py-4 bg-retro-red border-4 border-black rounded-xl shadow-retro hover:translate-y-1 hover:shadow-none transition-all"
												>
													<span className="font-arcade text-white font-bold text-xs uppercase group-hover:scale-110 block transition-transform">
														INVÁLIDA
													</span>
												</button>

												<button
													onClick={() => handleVoteClick("valid")}
													className="group relative px-6 py-4 bg-retro-green border-4 border-black rounded-xl shadow-retro hover:translate-y-1 hover:shadow-none transition-all"
												>
													<span className="font-arcade text-white font-bold text-xs uppercase group-hover:scale-110 block transition-transform">
														VÁLIDA
													</span>
												</button>
											</>
										);
									})()}
								</div>

								{voteStatus && (
									<div className="text-xs text-black font-bold uppercase tracking-widest mt-4">
										Votos recibidos: <span>{voteStatus.voteCount}</span> /{" "}
										{voteStatus.totalPlayers}
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default TrialModal;
