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
	// Estilo para simular escritura a mano
	const handwritingStyle = { fontFamily: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", sans-serif' };

	return (
		<div className="min-h-screen bg-[#d6c096] flex items-center justify-center px-4 py-12 font-sans relative overflow-hidden">
			{/* Textura de madera */}
			<div className="absolute inset-0 opacity-30" style={{
				backgroundImage: 'repeating-linear-gradient(45deg, #bfa376 25%, transparent 25%, transparent 75%, #bfa376 75%, #bfa376), repeating-linear-gradient(45deg, #bfa376 25%, #d6c096 25%, #d6c096 75%, #bfa376 75%, #bfa376)',
				backgroundPosition: '0 0, 10px 10px',
				backgroundSize: '20px 20px'
			}}></div>

			<div className="w-full max-w-md relative z-10">
				{/* Tablero del Clipboard */}
				<div className="bg-[#5d4037] rounded-3xl p-3 shadow-2xl relative">
					
					{/* Clip Metálico (Parte superior) */}
					<div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-32 h-16 z-20">
						<div className="w-full h-full bg-gradient-to-b from-gray-300 to-gray-400 rounded-lg shadow-lg border-t-4 border-gray-500 flex items-center justify-center">
							{/* Detalle del resorte */}
							<div className="w-24 h-8 bg-black/10 rounded-full border-b border-white/50"></div>
						</div>
					</div>

					{/* Hoja de Papel */}
					<div className="bg-white rounded-lg shadow-md relative overflow-hidden pt-16 px-8 pb-8"
						 style={{
							 backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)',
							 backgroundSize: '100% 2rem',
							 lineHeight: '2rem'
						 }}>
						
						<div className="relative z-10 h-full flex flex-col">
							<div className="text-center mb-6">
								<div className="inline-block border-4 border-double border-slate-800 px-6 py-1 transform -rotate-1 mb-2">
									<h1 className="text-3xl font-bold text-slate-800 uppercase tracking-widest" style={handwritingStyle}>
										REGISTRO
									</h1>
								</div>
								<p className="text-slate-500 text-xs font-bold uppercase tracking-wide">Nuevo Jugador</p>
							</div>

							{error && (
								<div className="mb-4 p-2 bg-red-100/90 border-2 border-red-400 text-red-600 text-sm font-bold transform -rotate-1 shadow-sm rounded" style={handwritingStyle}>
									🖍️ {error}
								</div>
							)}

							{exito && (
								<div className="mb-4 p-2 bg-green-100/90 border-2 border-green-400 text-green-600 text-sm font-bold transform rotate-1 shadow-sm rounded" style={handwritingStyle}>
									⭐ {exito}
								</div>
							)}

							<form onSubmit={handleSubmit} className="space-y-0 mt-2">
								<div className="grid grid-cols-2 gap-4 mb-8">
									<div className="relative group">
										<input
											type="text"
											value={firstName}
											onChange={(e) => setFirstName(e.target.value)}
											className="w-full bg-transparent border-b-2 border-blue-200 focus:border-blue-600 outline-none text-blue-900 text-xl h-8 pt-1 placeholder-blue-200/50 transition-colors"
											placeholder="Nombre"
											style={handwritingStyle}
											required
										/>
									</div>
									<div className="relative group">
										<input
											type="text"
											value={lastName}
											onChange={(e) => setLastName(e.target.value)}
											className="w-full bg-transparent border-b-2 border-blue-200 focus:border-blue-600 outline-none text-blue-900 text-xl h-8 pt-1 placeholder-blue-200/50 transition-colors"
											placeholder="Apellido"
											style={handwritingStyle}
											required
										/>
									</div>
								</div>

								<div className="relative group mb-8">
									<input
										type="text"
										value={username}
										onChange={(e) => setUsername(e.target.value)}
										className="w-full bg-transparent border-b-2 border-blue-200 focus:border-blue-600 outline-none text-blue-900 text-xl h-8 pt-1 placeholder-blue-200/50 transition-colors"
										placeholder="Username (Opcional)"
										style={handwritingStyle}
									/>
								</div>

								<div className="relative group mb-8">
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="w-full bg-transparent border-b-2 border-blue-200 focus:border-blue-600 outline-none text-blue-900 text-xl h-8 pt-1 placeholder-blue-200/50 transition-colors"
										placeholder="Email"
										style={handwritingStyle}
										required
									/>
								</div>

								<div className="relative group mb-8">
									<input
										type="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="w-full bg-transparent border-b-2 border-blue-200 focus:border-blue-600 outline-none text-blue-900 text-xl h-8 pt-1 placeholder-blue-200/50 transition-colors"
										placeholder="Contraseña"
										style={handwritingStyle}
										required
									/>
								</div>

								<button
									type="submit"
									disabled={loading}
									className={`w-full mt-6 py-3 bg-blue-100 border-2 border-blue-400 text-blue-800 font-bold text-xl uppercase tracking-widest hover:bg-blue-200 transform transition-all duration-150 hover:-rotate-1 shadow-[3px_3px_0px_rgba(96,165,250,1)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] ${
										loading ? "opacity-50 cursor-not-allowed" : ""
									}`}
									style={handwritingStyle}
								>
									{loading ? "Escribiendo..." : "¡Listo!"}
								</button>
							</form>

							<div className="mt-8 text-center">
								<p className="text-sm text-slate-500 font-bold" style={handwritingStyle}>
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
			</div>
		</div>
	);
};

export default RegisterView;
