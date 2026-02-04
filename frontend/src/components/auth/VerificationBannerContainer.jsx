import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import VerificationBannerView from "./VerificationBannerView.jsx";

// Container para el banner de verificación, verifica si el usuario está verificado y si el banner ha sido ocultado
const VerificationBannerContainer = () => {
	const { resendVerification } = useAuth();
	const [sent, setSent] = useState(false);
	const [countdown, setCountdown] = useState(null);

	const [hidden, setHidden] = useState(() => {
		return sessionStorage.getItem("verificationBannerHidden") === "true";
	});

	useEffect(() => {
		if (countdown === null) return;

		if (countdown > 0) {
			const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
			return () => clearTimeout(timer);
		} else {
			setHidden(true);
			sessionStorage.setItem("verificationBannerHidden", "true");
		}
	}, [countdown]);

	if (hidden) return null;

	const handleResend = async () => {
		try {
			setSent(true);
			await resendVerification();
			setCountdown(5);
		} catch (error) {
			console.error(error);
			setSent(false);
		}
	};

	const hideBanner = () => {
		setHidden(true);
		sessionStorage.setItem("verificationBannerHidden", "true");
	};

	return (
		<VerificationBannerView
			sent={sent}
			countdown={countdown}
			handleResend={handleResend}
			hideBanner={hideBanner}
			hidden={hidden}
		/>
	);
};

export default VerificationBannerContainer;
