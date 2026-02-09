import { motion } from "framer-motion";
import PropTypes from "prop-types";

const ResetPasswordView = ({
	password,
	setPassword,
	confirmPassword,
	setConfirmPassword,
	message,
	loading,
	handleSubmit,
	handleNavigate,
}) => {
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
				className="bg-white border-4 border-black shadow-retro rounded-3xl p-8 max-w-md w-full relative z-10"
			>
				<h2 className="text-xl uppercase mb-6 text-center">Nueva Contraseña</h2>

				{message.text && (
					<div
						className={`p-4 rounded-xl mb-6 text-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] text-xs ${
							message.type === "success"
								? "bg-green-200 text-green-900"
								: "bg-red-200 text-red-900"
						}`}
					>
						{message.text}
					</div>
				)}

				{message.type !== "success" && (
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-gray-500 mb-2 text-[10px] uppercase">
								Nueva Contraseña
							</label>
							<input
								type="password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full bg-white border-4 border-black rounded-xl px-4 py-3 text-black focus:outline-none focus:bg-yellow-50 text-base"
							/>
						</div>

						<div>
							<label className="block text-gray-500 mb-2 text-[10px] uppercase">
								Confirmar Contraseña
							</label>
							<input
								type="password"
								required
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className="w-full bg-white border-4 border-black rounded-xl px-4 py-3 text-black focus:outline-none focus:bg-yellow-50 text-base"
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-retro-purple hover:bg-purple-400 border-4 border-black text-white py-3 rounded-xl shadow-retro-sm hover:translate-y-1 hover:shadow-none transition-all text-xs uppercase"
						>
							{loading ? "Guardando..." : "Cambiar Contraseña"}
						</button>
					</form>
				)}

				{message.type === "success" && (
					<button
						onClick={() => handleNavigate("/login")}
						className="w-full bg-retro-blue hover:bg-blue-400 border-4 border-black text-white py-3 rounded-xl shadow-retro-sm hover:translate-y-1 hover:shadow-none transition-all text-xs uppercase mt-4"
					>
						Ir al Login ahora
					</button>
				)}
			</motion.div>
		</div>
	);
};

ResetPasswordView.propTypes = {
	password: PropTypes.string.isRequired,
	setPassword: PropTypes.func.isRequired,
	confirmPassword: PropTypes.string.isRequired,
	setConfirmPassword: PropTypes.func.isRequired,
	message: PropTypes.object.isRequired,
	loading: PropTypes.bool.isRequired,
	handleSubmit: PropTypes.func.isRequired,
	handleNavigate: PropTypes.func.isRequired,
};

export default ResetPasswordView;
