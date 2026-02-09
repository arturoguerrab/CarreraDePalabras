import React, { useEffect } from "react";

const ToastNotification = ({
	message,
	type = "error",
	onClose,
	duration = 3000,
}) => {
	useEffect(() => {
		if (message) {
			const timer = setTimeout(() => {
				onClose();
			}, duration);
			return () => clearTimeout(timer);
		}
	}, [message, duration, onClose]);

	if (!message) return null;

	const isError = type === "error";
	const bgColor = isError ? "bg-retro-red" : "bg-retro-green";
	const borderColor = "border-black";

	return (
		<div className="fixed top-24 left-1/2 -translate-x-1/2 z-100 animate-bounce-in pointer-events-none">
			<div
				className={`${bgColor} border-4 ${borderColor} shadow-retro text-white px-6 py-4 rounded-xl flex items-center gap-4 min-w-[300px] max-w-md transform rotate-1`}
			>
				{/* Icon */}
				<div className="bg-white border-2 border-black rounded-full p-1 text-black text-xl w-8 h-8 flex items-center justify-center font-bold">
					{isError ? "!" : "i"}
				</div>

				{/* Message */}
				<div className="flex-1">
					<p className="text-[10px] uppercase font-bold tracking-widest leading-tight">
						{message}
					</p>
				</div>
			</div>
		</div>
	);
};

export default ToastNotification;
