import { useAuth } from "../../context/AuthContext.jsx";
import { Navigate, Outlet } from "react-router-dom";

//Componente para proteger rutas públicas (login, registro, etc). Si el usuario ya está autenticado, lo redirige al lobby.
const RedirectIfAuthenticated = () => {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="min-h-screen bg-retro-bg flex items-center justify-center font-arcade">
				<h2 className="text-white text-xs animate-pulse">CARGANDO...</h2>
			</div>
		);
	}

	if (user) {
		return <Navigate to="/lobby" replace />;
	}

	return <Outlet />;
};

export default RedirectIfAuthenticated;
