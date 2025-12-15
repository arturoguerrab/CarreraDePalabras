import { useContext } from "react";
import { StopContext } from "../../context/StopContext.jsx";
import { Navigate, Outlet } from "react-router-dom";

const ValidateSession = () => {
	const { user, isLoading } = useContext(StopContext);

	if (isLoading) return <h1>Cargando sesión...</h1>;

	if (!user) return <Navigate to="/login" replace />;

	return <Outlet />;
};

export default ValidateSession;
