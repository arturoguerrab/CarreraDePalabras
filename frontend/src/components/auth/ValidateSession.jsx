import {useContext } from "react";
import { StopContext } from "../../context/StopContext.jsx";
import { Navigate, Outlet } from "react-router-dom";


export const useAuth = () => useContext(StopContext);
const ValidateSession = () => {
    const { user, isLoading } = useAuth(); // Obtener el estado de autenticación
    console.log(user, isLoading);
    // 1. Si aún estamos verificando la sesión con el backend, muestra carga
  if (isLoading) return <h1>Cargando sesión...</h1>;

  // 2. Si terminó de cargar y NO está autenticado, redirige al login
  // 'replace' evita que puedan volver atrás con el botón del navegador
  if (!user) return <Navigate to="/login" replace />;

  // 3. Si está autenticado, renderiza las rutas hijas (Outlet)
  return <Outlet />;
};

export default ValidateSession