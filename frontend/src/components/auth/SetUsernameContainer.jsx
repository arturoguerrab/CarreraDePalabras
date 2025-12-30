import React, { useState, useContext } from "react";
import { StopContext } from "../../context/StopContext";
import SetUsernameView from "./SetUsernameView";

const SetUsernameContainer = () => {
	const [username, setUsername] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const { updateUsername, logout } = useContext(StopContext);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		if (!username.trim() || username.length < 3) {
			setError("El nombre debe tener al menos 3 letras.");
			setLoading(false);
			return;
		}

		try {
			await updateUsername(username);
			// Al tener éxito, el Contexto actualiza el 'user'.
			// ValidateSession detectará que ya hay username y desmontará este componente automáticamente.
		} catch (err) {
			if (err.response?.data?.message) {
				setError(err.response.data.message);
			} else {
				setError("Error al guardar. Intenta otro nombre.");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<SetUsernameView
			username={username}
			setUsername={setUsername}
			error={error}
			loading={loading}
			handleSubmit={handleSubmit}
			handleLogout={logout}
		/>
	);
};

export default SetUsernameContainer;