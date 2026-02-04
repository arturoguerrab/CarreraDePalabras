import PropTypes from "prop-types";

const VerificationBannerView = ({
	sent,
	countdown,
	handleResend,
	hideBanner,
	hidden,
}) => {
	if (hidden) return null;

	return (
		<div className="bg-yellow-400 text-black text-xs p-2 text-center font-bold font-arcade border-b-4 border-black relative z-50">
			{sent ? (
				<span>
					¡Enlace reenviado! Este mensaje desaparecerá en{" "}
					{countdown !== null ? countdown : 5}...
				</span>
			) : (
				<span>
					Tu cuenta no está verificada.{" "}
					<button
						onClick={handleResend}
						className="underline hover:text-white cursor-pointer ml-2"
					>
						Reenviar Link
					</button>
					<button
						onClick={hideBanner}
						className="ml-4 text-[10px] opacity-70 cursor-pointer"
					>
						(X)
					</button>
				</span>
			)}
		</div>
	);
};

VerificationBannerView.propTypes = {
	sent: PropTypes.bool.isRequired,
	countdown: PropTypes.number,
	handleResend: PropTypes.func.isRequired,
	hideBanner: PropTypes.func.isRequired,
	hidden: PropTypes.bool.isRequired,
};

export default VerificationBannerView;
