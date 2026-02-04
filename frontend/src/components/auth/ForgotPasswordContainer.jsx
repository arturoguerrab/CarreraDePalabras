import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import ForgotPasswordView from "./ForgotPasswordView.jsx";

const ForgotPasswordContainer = () => {
	const { forgotPassword } = useAuth();
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState({ text: "", type: "" });
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage({ text: "", type: "" });

		try {
			await forgotPassword(email);
			setMessage({
				text: "Si el correo existe, recibirás instrucciones para restablecer tu contraseña.",
				type: "success",
			});
		} catch (error) {
			console.error(error);
			setMessage({
				text: "Si el correo existe, recibirás instrucciones para restablecer tu contraseña.",
				type: "success",
			});
		}
		setLoading(false);
	};

	return (
		<ForgotPasswordView
			email={email}
			setEmail={setEmail}
			message={message}
			loading={loading}
			handleSubmit={handleSubmit}
		/>
	);
};

export default ForgotPasswordContainer;
