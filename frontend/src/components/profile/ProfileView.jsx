import { motion } from "framer-motion";

const ProfileView = ({
	formData,
	message,
	loading,
	handleChange,
	handleProfileUpdate,
	handleUsernameUpdate,
	handlePasswordChange,
	handleNavigate,
	userHasPassword,
	setPasswordMsg,
	handleSetPassword,
	newSetPassword,
	setNewSetPassword,
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
				className="bg-white border-4 border-black shadow-retro rounded-3xl p-6 md:p-8 max-w-4xl w-full relative z-10"
			>
				<div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
					<h2 className="text-xl md:text-2xl text-black uppercase">
						Mi Perfil
					</h2>
					<button
						onClick={() => handleNavigate("/lobby")}
						className="text-xs md:text-sm bg-gray-200 hover:bg-gray-300 text-black border-2 border-black px-4 py-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all uppercase"
					>
						← Volver
					</button>
				</div>

				{message.text && (
					<div
						className={`p-4 rounded-xl mb-6 text-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] text-xs md:text-sm ${
							message.type === "success"
								? "bg-green-200 text-green-900"
								: "bg-red-200 text-red-900"
						}`}
					>
						{message.text}
					</div>
				)}

				<div className="grid md:grid-cols-2 gap-8">
					{/* Datos Personales */}
					<div className="space-y-8">
						<div>
							<h3 className="text-sm md:text-base text-blue-600 mb-4 uppercase">
								Datos Personales
							</h3>
							<form onSubmit={handleProfileUpdate} className="space-y-4">
								<div>
									<label className="block text-gray-500 mb-2 text-[10px] uppercase">
										Nombre
									</label>
									<input
										type="text"
										name="firstName"
										value={formData.firstName}
										onChange={handleChange}
										className="w-full bg-white border-4 border-black rounded-xl px-4 py-3 text-black focus:outline-none focus:bg-yellow-50 text-xs md:text-sm font-sans"
									/>
								</div>
								<div>
									<label className="block text-gray-500 mb-2 text-[10px] uppercase">
										Apellido
									</label>
									<input
										type="text"
										name="lastName"
										value={formData.lastName}
										onChange={handleChange}
										className="w-full bg-white border-4 border-black rounded-xl px-4 py-3 text-black focus:outline-none focus:bg-yellow-50 text-xs md:text-sm font-sans"
									/>
								</div>
								<button
									type="submit"
									disabled={loading}
									className="w-full bg-retro-blue hover:bg-blue-400 border-4 border-black text-white py-3 rounded-xl shadow-retro hover:translate-y-1 hover:shadow-retro-sm transition-all text-xs uppercase"
								>
									Actualizar Datos
								</button>
							</form>
						</div>

						<form
							onSubmit={handleUsernameUpdate}
							className="space-y-4 pt-4 border-t-4 border-black/10"
						>
							<div>
								<label className="block text-gray-500 mb-2 text-[10px] uppercase">
									Usuario
								</label>
								<input
									type="text"
									name="username"
									value={formData.username}
									onChange={handleChange}
									className="w-full bg-white border-4 border-black rounded-xl px-4 py-3 text-black focus:outline-none focus:bg-yellow-50 text-xs md:text-sm font-sans"
								/>
							</div>
							<button
								type="submit"
								disabled={loading}
								className="w-full bg-retro-pink hover:bg-pink-400 border-4 border-black text-white py-3 rounded-xl shadow-retro hover:translate-y-1 hover:shadow-retro-sm transition-all text-xs uppercase"
							>
								Cambiar Username
							</button>
						</form>
					</div>

					{/* Seguridad y Stats */}
					<div className="space-y-8">
						{/* Password Change Section - Check hasPassword */}
						{userHasPassword ? (
							<div>
								<h3 className="text-sm md:text-base text-purple-600 mb-4 uppercase">
									Seguridad
								</h3>
								<form onSubmit={handlePasswordChange} className="space-y-4">
									<div>
										<label className="block text-gray-500 mb-2 text-[10px] uppercase">
											Contraseña Actual
										</label>
										<input
											type="password"
											name="currentPassword"
											value={formData.currentPassword}
											onChange={handleChange}
											className="w-full bg-white border-4 border-black rounded-xl px-4 py-3 text-black focus:outline-none focus:bg-yellow-50 text-xs md:text-sm font-sans"
										/>
									</div>
									<div>
										<label className="block text-gray-500 mb-2 text-[10px] uppercase">
											Nueva Contraseña
										</label>
										<input
											type="password"
											name="newPassword"
											value={formData.newPassword}
											onChange={handleChange}
											className="w-full bg-white border-4 border-black rounded-xl px-4 py-3 text-black focus:outline-none focus:bg-yellow-50 text-xs md:text-sm font-sans"
										/>
									</div>
									<button
										type="submit"
										disabled={loading}
										className="w-full bg-retro-purple hover:bg-purple-400 border-4 border-black text-white py-3 rounded-xl shadow-retro hover:translate-y-1 hover:shadow-retro-sm transition-all text-xs uppercase"
									>
										Cambiar Contraseña
									</button>
								</form>
							</div>
						) : (
							<div className="bg-gray-100 p-4 border-4 border-gray-300 rounded-xl mt-6">
								<h3 className="text-sm border-b-4 border-gray-300 pb-2 mb-4 uppercase">
									Seguridad
								</h3>
								<div className="mb-4 text-[10px] text-gray-600">
									<p>Tu cuenta está vinculada a Google.</p>
									<p className="mt-2">
										¿Quieres establecer una contraseña para acceder con email?
									</p>
								</div>
								{/* SetPassword Form Embed */}
								{setPasswordMsg.text && (
									<div
										className={`mb-4 text-xs text-center p-2 border-2 rounded ${
											setPasswordMsg.type === "success"
												? "bg-green-200 border-green-500 text-green-900"
												: "bg-red-200 border-red-500 text-red-900"
										}`}
									>
										{setPasswordMsg.text}
									</div>
								)}
								<form onSubmit={handleSetPassword}>
									<div className="mb-4">
										<label className="block text-[10px] text-gray-500 mb-1 uppercase">
											Nueva Contraseña
										</label>
										<input
											type="password"
											required
											minLength={6}
											value={newSetPassword}
											onChange={(e) => setNewSetPassword(e.target.value)}
											className="w-full bg-white border-4 border-gray-300 p-2 text-xs focus:outline-none focus:border-indigo-500 rounded-lg"
											placeholder="********"
										/>
									</div>
									<button
										type="submit"
										className="w-full bg-retro-pink border-4 border-black text-white py-2 rounded-lg text-xs uppercase hover:bg-pink-400 shadow-retro hover:shadow-retro-sm hover:translate-y-[2px] transition-all"
									>
										Crear Contraseña
									</button>
								</form>
							</div>
						)}

						{/* Estadísticas (Placeholder) */}
						<div>
							<h3 className="text-sm md:text-base text-yellow-600 mb-4 uppercase">
								Estadísticas
							</h3>
							<div className="bg-yellow-50 border-4 border-black rounded-xl p-6 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
								<p className="text-xs text-gray-500 mb-4 uppercase">
									Próximamente
								</p>
								<div className="text-4xl mb-4">🏆</div>
								<p className="text-[10px] text-gray-400 uppercase leading-relaxed">
									Aquí verás tus victorias y puntajes.
								</p>
							</div>
						</div>
					</div>
				</div>
			</motion.div>
		</div>
	);
};

export default ProfileView;
