const ConfirmationModalView = ({
	isOpen,
	title = "¡CUIDADO!",
	message = "¿Estás seguro de que quieres salir?",
	onConfirm,
	onCancel,
	confirmText = "SÍ, SALIR",
	cancelText = "VOLVER",
	confirmColor = "bg-retro-red", // Replaced bg-[#ef4444]
}) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-100 flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
				onClick={onCancel}
			></div>

			{/* Modal Card */}
			<div className="bg-white border-4 border-black shadow-retro-lg rounded-3xl p-8 max-w-sm w-full relative z-10 animate-in zoom-in-95 duration-200 text-center font-arcade">
				{/* Decoración Superior */}
				<div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-400 border-4 border-black px-4 py-2 rounded-xl shadow-sm rotate-2">
					<span className="text-xl">⚠️</span>
				</div>

				<h2 className="text-sm text-black mb-6 uppercase tracking-wider mt-4">
					{title}
				</h2>

				<p className="text-[10px] text-gray-500 mb-8 uppercase leading-relaxed tracking-tighter">
					{message}
				</p>

				<div className="space-y-4">
					<button
						onClick={onConfirm}
						className={`w-full py-4 ${confirmColor} border-4 border-black text-white text-[10px] uppercase rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all font-bold`}
					>
						{confirmText}
					</button>

					<button
						onClick={onCancel}
						className="w-full py-4 bg-white border-4 border-black text-black text-[10px] uppercase hover:bg-gray-100 rounded-xl shadow-retro hover:translate-y-1 hover:shadow-none transition-all font-bold"
					>
						{cancelText}
					</button>
				</div>

				{/* Decoración Inferior */}
				<div className="mt-8 flex justify-center gap-2 opacity-20">
					<div className="w-2 h-2 bg-black rounded-full animate-bounce delay-75"></div>
					<div className="w-2 h-2 bg-black rounded-full animate-bounce delay-150"></div>
					<div className="w-2 h-2 bg-black rounded-full animate-bounce delay-225"></div>
				</div>
			</div>
		</div>
	);
};

export default ConfirmationModalView;
