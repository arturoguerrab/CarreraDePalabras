import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { StopContext } from "../../context/StopContext";
import LoginView from "./LoginView";

const LoginContainer = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const navigate = useNavigate();
	const { login, loginWithGoogle } = useContext(StopContext);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		if (!email.trim() || !password.trim()) {
			setError("Por favor, completa todos los campos.");
			setLoading(false);
			return;
		}

		try {
			const response = await login(email, password);

			if (response.status === 200) {
				navigate("/lobby");
			} else {
				setError("Error al iniciar sesión");
			}
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
		<LoginView
			email={email}
			setEmail={setEmail}
			password={password}
			setPassword={setPassword}
			error={error}
			loading={loading}
			handleSubmit={handleSubmit}
			loginWithGoogle={loginWithGoogle}
		/>
	);
};

export default LoginContainer;
