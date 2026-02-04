import { motion } from "framer-motion";
import PropTypes from "prop-types";

const VerifyEmailView = ({ status, message, handleNavigate }) => {
	return (
		<div className="min-h-screen bg-retro-bg flex items-center justify-center p-4 font-arcade relative overflow-hidden">
			{/* Background Grid */}
			<div
				className="absolute inset-0 opacity-10"
				style={{
					backgroundImage:
						"linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)",
					backgroundSize: "40px 40px",
				}}
			></div>

			<motion.div
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				className="bg-white border-4 border-black shadow-retro rounded-3xl p-8 max-w-md w-full relative z-10 text-center"
			>
				<h2 className="text-xl uppercase mb-6">Verificación</h2>

				<div
					className={`p-4 border-4 border-black rounded-xl mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] ${
						status === "success"
							? "bg-green-200 text-green-900"
							: status === "error"
								? "bg-red-200 text-red-900"
								: "bg-yellow-200 text-yellow-900"
					}`}
				>
					<p className="text-xs">{message}</p>
				</div>

				{status === "success" && (
					<p className="text-[10px] text-gray-500">
						Ya puedes cerrar esta pestaña.
					</p>
				)}

				{/* Solo mostramos botón de login si hubo error, o opcional si fue éxito pero quiere ir al login */}
				{status !== "success" && (
					<button
						onClick={() => handleNavigate("/login")}
						className="w-full bg-retro-blue hover:bg-blue-400 border-4 border-black text-white py-3 rounded-xl shadow-retro-sm hover:translate-y-1 hover:shadow-none transition-all text-xs uppercase mt-4"
					>
						Ir al Login
					</button>
				)}
			</motion.div>
		</div>
	);
};

VerifyEmailView.propTypes = {
	status: PropTypes.string.isRequired,
	message: PropTypes.string.isRequired,
	handleNavigate: PropTypes.func.isRequired,
};

export default VerifyEmailView;
