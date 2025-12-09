import React from "react";
import { Link } from "react-router-dom";

const RegisterView = ({
	email,
	setEmail,
	password,
	setPassword,
	error,
	exito,
	loading,
	handleSubmit,
}) => {
	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
			<div className="w-full max-w-md">
				<div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-gray-800">Crear cuenta</h1>
						<p className="text-gray-500 mt-2">Regístrate para jugar</p>
					</div>

					{error && (
						<div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
							{error}
						</div>
					)}

					{exito && (
						<div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
							{exito}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Email
							</label>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
								placeholder="tujugador@ejemplo.com"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Contraseña
							</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
								placeholder="Mínimo 6 caracteres"
								required
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className={`w-full py-3 bg-blue-600 text-white font-medium rounded-lg transition duration-200 ${
								loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
							}`}
						>
							{loading ? "Creando..." : "Crear cuenta"}
						</button>
					</form>

					<p className="text-center text-sm text-gray-500 mt-8">
						¿Ya tienes cuenta?
						<Link
							to="/login"
							className="text-blue-600 hover:underline font-medium"
						>
							Iniciar sesión
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default RegisterView;
