import { useAuth } from "../../context/AuthContext.jsx";
import { useSound } from "../../context/SoundContext.jsx";
import LobbyView from "./LobbyView.jsx";

const LobbyContainer = () => {
	const { logout, user } = useAuth();
	const { muted, toggleMute } = useSound();

	// Prioridad de visualización: Username > Nombre > Email
	const displayName =
		user?.username ||
		user?.userName ||
		user?.displayName ||
		user?.firstName ||
		user?.email;

	return (
		<LobbyView
			displayName={displayName}
			muted={muted}
			toggleMute={toggleMute}
			logout={logout}
		/>
	);
};

export default LobbyContainer;
