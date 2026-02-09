import { Link } from "react-router-dom";

const LoginView = ({
	email,
	setEmail,
	password,
	setPassword,
	error,
	loading,
	handleSubmit,
	loginWithGoogle,
}) => {
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

			{/* Decoración: Bloques Arcade */}
			<div className="absolute top-20 left-10 w-16 h-16 bg-[#4ade80] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transform -rotate-12"></div>
			<div className="absolute bottom-20 right-10 w-24 h-8 bg-[#fbbf24] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transform rotate-6"></div>

			<div className="w-full max-w-md relative z-10">
				{/* Card Principal */}
				<div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] rounded-3xl p-8 relative text-center">
					<h1 className="text-2xl text-black mb-8 uppercase drop-shadow-sm">
						STOPIFY
					</h1>
					<p className="text-xs text-gray-500 mb-6 uppercase">Acceso Jugador</p>

					{/* Alerta de Error */}
					{error && (
						<div className="mb-6 p-2 bg-red-100 border-4 border-black text-red-600 text-xs uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full bg-gray-100 border-4 border-black p-3 text-black text-base focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all outline-none rounded-xl placeholder-gray-400"
							placeholder="Email"
							required
						/>

						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full bg-gray-100 border-4 border-black p-3 text-black text-base focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all outline-none rounded-xl placeholder-gray-400"
							placeholder="Contraseña"
							required
						/>

						<div className="flex justify-end mt-1">
							<Link
								to="/forgot-password"
								className="text-[10px] text-gray-500 hover:text-black uppercase underline decoration-dashed"
							>
								¿Olvidaste tu contraseña?
							</Link>
						</div>

						<button
							type="submit"
							disabled={loading}
							className={`w-full py-4 bg-retro-blue border-4 border-black text-white text-xs uppercase hover:bg-blue-400 rounded-xl shadow-retro hover:translate-y-1 hover:shadow-retro-sm transition-all ${
								loading ? "opacity-50 cursor-not-allowed" : ""
							}`}
						>
							{loading ? "Buscando..." : "Iniciar Sesión"}
						</button>
					</form>

					{/* Separador */}
					<div className="relative flex py-6 items-center opacity-50">
						<div className="flex-grow border-t-4 border-black border-dashed"></div>
						<span className="flex-shrink-0 mx-4 text-black text-[10px] uppercase">
							O usa Google
						</span>
						<div className="flex-grow border-t-4 border-black border-dashed"></div>
					</div>

					{/* Google Auth */}
					<button
						onClick={loginWithGoogle}
						disabled={loading}
						className={`w-full py-4 bg-white border-4 border-black text-black text-xs uppercase hover:bg-gray-100 rounded-xl shadow-retro hover:translate-y-1 hover:shadow-retro-sm transition-all ${
							loading ? "opacity-50 cursor-not-allowed" : ""
						}`}
					>
						{loading ? "..." : "Google"}
					</button>

					<div className="mt-8 text-center text-[10px] text-gray-500">
						¿No tienes cuenta?{" "}
						<Link
							to="/registro"
							className="text-blue-600 hover:text-blue-800 underline decoration-wavy decoration-2"
						>
							Registrate
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginView;
