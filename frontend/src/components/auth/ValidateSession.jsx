import { useAuth } from "../../context/AuthContext.jsx";
import { Navigate, Outlet } from "react-router-dom";
import SetUsernameContainer from "./SetUsernameContainer";

/**
 * VALIDATE SESSION
 * Middleware de cliente que verifica si hay un usuario logueado.
 * Si el usuario existe pero no tiene nickname (ej. tras Google OAuth), fuerza la vista de SetUsername.
 */
const ValidateSession = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#6366f1] flex items-center justify-center font-['Press_Start_2P']">
        <h2 className="text-white text-xs animate-pulse">CARGANDO SESIÓN...</h2>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Caso: Usuario logueado sin nickname (ej. primer login con Google)
  if (!user.username) {
    return <SetUsernameContainer />;
  }

  return <Outlet />;
};

export default ValidateSession;
