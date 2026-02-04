import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import VerifyEmailView from "./VerifyEmailView.jsx";

const VerifyEmailContainer = () => {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");
	const { verifyEmail } = useAuth();
	const navigate = useNavigate();
	const [status, setStatus] = useState("verifying");
	const [message, setMessage] = useState("Verificando tu correo...");
	const processed = useRef(false);

	useEffect(() => {
		if (!token) {
			setStatus("error");
			setMessage("Token no válido o no encontrado.");
			return;
		}

		if (processed.current) return;
		processed.current = true;

		const verify = async () => {
			try {
				await verifyEmail(token);
				setStatus("success");
				setMessage("¡Tu cuenta ha sido verificada con éxito!");
			} catch (error) {
				setStatus("error");
				setMessage(
					error.response?.data?.message || "Error al verificar el correo.",
				);
			}
		};

		verify();
	}, [token, verifyEmail]);

	return (
		<VerifyEmailView
			status={status}
			message={message}
			handleNavigate={navigate}
		/>
	);
};

export default VerifyEmailContainer;
