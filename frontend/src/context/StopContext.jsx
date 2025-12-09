import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const StopContext = createContext();
const StopContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Llama a la ruta que configuraste en Express (req.isAuthenticated())
        const response = await axios.get("http://localhost:3000/auth/user", {
          withCredentials: true
        });
        console.log(response);

        if (response.data.isLoggedIn) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error al verificar la sesión:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const loginWithGoogle = () => {
    // Redirige al usuario al endpoint de Passport/Google en el backend
    // Express se encargará de redirigir a Google, y luego de vuelta a tu frontend.
    window.location.href = "http://localhost:3000/auth/google";
  };
  const logout = async () => {
    try {
      await axios.get("http://localhost:3000/auth/logout", {
        withCredentials: true
      }); // Llama al endpoint de Express para cerrar sesión
      setUser(null);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const value = { user, isLoading, loginWithGoogle, logout };
  return <StopContext.Provider value={value}>{children}</StopContext.Provider>;
};

export default StopContextProvider;
