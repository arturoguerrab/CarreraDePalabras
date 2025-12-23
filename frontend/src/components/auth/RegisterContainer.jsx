import React, { useState, useContext } from "react";
import { StopContext } from "../../context/StopContext";
import RegisterView from "./RegisterView";

const RegisterContainer = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [username, setUsername] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [error, setError] = useState("");
	const [exito, setExito] = useState("");
	const [loading, setLoading] = useState(false);

	const { register } = useContext(StopContext); // Usamos el contexto

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setExito("");
		setLoading(true);

		if (!email.trim() || !password.trim() || !firstName.trim() || !lastName.trim()) {
			setError("Por favor completa los campos obligatorios (*)");
			setLoading(false);
			return;
		}
		if (password.length < 6) {
			setError("La contraseña debe tener al menos 6 caracteres");
			setLoading(false);
			return;
		}

		try {
			await register({ email, password, username, firstName, lastName }); // Llamamos a la función del contexto
			setExito("¡Cuenta creada con éxito! Ya puedes iniciar sesión.");
			setEmail("");
			setPassword("");
			setUsername("");
			setFirstName("");
			setLastName("");
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
			username={username}
			setUsername={setUsername}
			firstName={firstName}
			setFirstName={setFirstName}
			lastName={lastName}
			setLastName={setLastName}
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
