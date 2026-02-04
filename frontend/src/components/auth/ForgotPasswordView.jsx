import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

const ForgotPasswordView = ({
	email,
	setEmail,
	message,
	loading,
	handleSubmit,
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
				<h2 className="text-xl uppercase mb-6 text-center">
					Recuperar Contraseña
				</h2>

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
					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label className="block text-gray-500 mb-2 text-[10px] uppercase">
								Ingresa tu Email
							</label>
							<input
								type="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full bg-white border-4 border-black rounded-xl px-4 py-3 text-black focus:outline-none focus:bg-yellow-50 text-xs font-sans"
								placeholder="tu@email.com"
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-retro-pink hover:bg-pink-400 border-4 border-black text-white py-3 rounded-xl shadow-retro-sm hover:translate-y-1 hover:shadow-none transition-all text-xs uppercase"
						>
							{loading ? "Enviando..." : "Enviar Enlace"}
						</button>
					</form>
				)}

				<div className="mt-6 text-center">
					<Link
						to="/login"
						className="text-[10px] text-blue-600 hover:underline uppercase"
					>
						Volver al Login
					</Link>
				</div>
			</motion.div>
		</div>
	);
};

ForgotPasswordView.propTypes = {
	email: PropTypes.string.isRequired,
	setEmail: PropTypes.func.isRequired,
	message: PropTypes.object.isRequired,
	loading: PropTypes.bool.isRequired,
	handleSubmit: PropTypes.func.isRequired,
};

export default ForgotPasswordView;
