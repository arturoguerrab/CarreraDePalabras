import React, { useState, useContext } from "react";
import { StopContext } from "../../context/StopContext";
import RegisterView from "./RegisterView";

const RegisterContainer = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [exito, setExito] = useState("");
	const [loading, setLoading] = useState(false);

	const { register } = useContext(StopContext); // Usamos el contexto

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setExito("");
		setLoading(true);

		if (!email.trim() || !password.trim()) {
			setError("Completa ambos campos");
			setLoading(false);
			return;
		}
		if (password.length < 6) {
			setError("La contraseña debe tener al menos 6 caracteres");
			setLoading(false);
			return;
		}

		try {
			await register(email, password); // Llamamos a la función del contexto
			setExito("¡Cuenta creada con éxito! Ya puedes iniciar sesión.");
			setEmail("");
			setPassword("");
		} catch (err) {
			if (err.response?.data?.message) {
				setError(err.response.data.message);
			} else {
				setError("Error de conexión. Inténtalo más tarde.");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<RegisterView
			email={email}
			setEmail={setEmail}
			password={password}
			setPassword={setPassword}
			error={error}
			exito={exito}
			loading={loading}
			handleSubmit={handleSubmit}
		/>
	);
};

export default RegisterContainer;
