import { useContext } from "react";
import { StopContext } from "../../context/StopContext.jsx";
import { Navigate, Outlet } from "react-router-dom";
import SetUsernameContainer from "./SetUsernameContainer";

const ValidateSession = () => {
  const { user, isLoading } = useContext(StopContext);

  if (isLoading) return <h1>Cargando sesión...</h1>;

  if (!user) return <Navigate to="/login" replace />;

  // Si el usuario está logueado (ej. Google) pero no tiene username configurado
  if (!user.username) {
    return <SetUsernameContainer />;
  }

  return <Outlet />;
};

export default ValidateSession;
