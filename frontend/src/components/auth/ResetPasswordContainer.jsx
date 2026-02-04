import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import ResetPasswordView from "./ResetPasswordView.jsx";

const ResetPasswordContainer = () => {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");
	const { resetPassword } = useAuth();
	const navigate = useNavigate();
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [message, setMessage] = useState({ text: "", type: "" });
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			setMessage({ text: "Las contraseñas no coinciden.", type: "error" });
			return;
		}

		if (password.length < 6) {
			setMessage({ text: "Mínimo 6 caracteres.", type: "error" });
			return;
		}

		setLoading(true);
		setMessage({ text: "", type: "" });

		try {
			await resetPassword(token, password);
			setMessage({
				text: "Contraseña actualizada. Redirigiendo...",
				type: "success",
			});
			setTimeout(() => navigate("/login"), 3000);
		} catch (error) {
			setMessage({
				text: error.response?.data?.message || "Error al restablecer.",
				type: "error",
			});
		}
		setLoading(false);
	};

	return (
		<ResetPasswordView
			password={password}
			setPassword={setPassword}
			confirmPassword={confirmPassword}
			setConfirmPassword={setConfirmPassword}
			message={message}
			loading={loading}
			handleSubmit={handleSubmit}
			handleNavigate={navigate}
		/>
	);
};

export default ResetPasswordContainer;
