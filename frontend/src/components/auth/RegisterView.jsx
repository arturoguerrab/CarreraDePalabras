import React from "react";
import { Link } from "react-router-dom";

const RegisterView = ({
	email,
	setEmail,
	username,
	setUsername,
	firstName,
	setFirstName,
	lastName,
	setLastName,
	password,
	setPassword,
	error,
	exito,
	loading,
	handleSubmit,
}) => {
	return (
		<div className="min-h-screen bg-[#6366f1] flex items-center justify-center px-4 py-12 font-['Press_Start_2P'] relative overflow-hidden">
			{/* Fondo Cuadriculado */}
			<div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>

			{/* Decoración: Bloques Arcade */}
			<div className="absolute top-20 left-10 w-16 h-16 bg-[#f472b6] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transform rotate-12"></div>
			<div className="absolute bottom-20 right-10 w-20 h-20 bg-[#60a5fa] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transform -rotate-6"></div>

			<div className="w-full max-w-md relative z-10">
				{/* Card Principal */}
				<div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] rounded-3xl p-8 relative text-center">
					
					<h1 className="text-2xl text-black mb-8 uppercase drop-shadow-sm">REGISTRO</h1>
					<p className="text-xs text-gray-500 mb-6 uppercase">Nuevo Jugador</p>

					{error && (
						<div className="mb-4 p-2 bg-red-100 border-4 border-black text-red-600 text-xs uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
							⚠️ {error}
						</div>
					)}

					{exito && (
						<div className="mb-4 p-2 bg-green-100 border-4 border-black text-green-600 text-xs uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
							⭐ {exito}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4 mt-2">
						<div className="grid grid-cols-2 gap-4">
							<div className="relative group">
								<input
									type="text"
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									className="w-full bg-gray-100 border-4 border-black p-3 text-black text-base md:text-sm focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all outline-none rounded-xl placeholder-gray-400"
									placeholder="Nombre"
									required
								/>
							</div>
							<div className="relative group">
								<input
									type="text"
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
									className="w-full bg-gray-100 border-4 border-black p-3 text-black text-base md:text-sm focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all outline-none rounded-xl placeholder-gray-400"
									placeholder="Apellido"
									required
								/>
							</div>
						</div>

						<div className="relative group">
							<input
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								className="w-full bg-gray-100 border-4 border-black p-3 text-black text-base md:text-sm focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all outline-none rounded-xl placeholder-gray-400"
								placeholder="Username (Opcional)"
							/>
						</div>

						<div className="relative group">
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full bg-gray-100 border-4 border-black p-3 text-black text-base md:text-sm focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all outline-none rounded-xl placeholder-gray-400"
								placeholder="Email"
								required
							/>
						</div>

						<div className="relative group">
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full bg-gray-100 border-4 border-black p-3 text-black text-base md:text-sm focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all outline-none rounded-xl placeholder-gray-400"
								placeholder="Contraseña"
								required
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className={`w-full mt-6 py-4 bg-[#16a34a] border-4 border-black text-white text-xs uppercase hover:bg-green-500 rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all ${
								loading ? "opacity-50 cursor-not-allowed" : ""
							}`}
						>
							{loading ? "Escribiendo..." : "¡Listo!"}
						</button>
					</form>

					<div className="mt-8 text-center">
						<p className="text-[10px] text-gray-500">
							¿Ya tienes tu carnet?{" "}
							<Link
								to="/login"
								className="text-blue-600 hover:text-blue-800 underline decoration-wavy decoration-2"
							>
								Entrar
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RegisterView;
