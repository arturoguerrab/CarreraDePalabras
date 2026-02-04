import React from "react";
import PropTypes from "prop-types";

const RaceCountdownView = ({ count, animate }) => {
	if (count === null) return null;
	const getTextColor = () => {
		if (count === "YA!") return "var(--color-retro-green-dark)";
		if (count === 1) return "var(--color-retro-yellow-dark)";
		return "var(--color-retro-red-dark)";
	};

	return (
		<div className="fixed inset-0 flex items-center justify-center z-9999 pointer-events-none select-none">
			{/* Contenedor Animado */}
			<div
				className={`
            relative flex items-center justify-center 
            w-56 h-56 bg-white rounded-3xl
            border-4 border-black shadow-retro-lg
            transition-all duration-150
            ${animate ? "scale-125 rotate-6" : "scale-100 rotate-0"}
         `}
			>
				<span
					className="text-6xl font-arcade"
					style={{
						color: getTextColor(),
						textShadow: "4px 4px 0px rgba(0,0,0,0.1)",
					}}
				>
					{count}
				</span>
			</div>
		</div>
	);
};

RaceCountdownView.propTypes = {
	count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	animate: PropTypes.bool,
};

export default RaceCountdownView;
