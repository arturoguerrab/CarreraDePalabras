import { createContext, useState, useEffect, useCallback, useContext } from "react";
import stopAPI from "../stopAPI";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- Verificación de Sesión Inicial ---
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await stopAPI.get("/auth/user");
        if (response.data.isLoggedIn) setUser(response.data.user);
        else setUser(null);
      } catch (error) {
        console.error("❌ Error de sesión:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await stopAPI.post("/auth/login", { email, password });
    if (response.data.user) setUser(response.data.user);
    return response;
  }, []);

  const register = useCallback((userData) => stopAPI.post("/auth/register", userData), []);

  const logout = useCallback(async () => {
    try {
      await stopAPI.get("/auth/logout");
      setUser(null);
    } catch (err) {
      console.error("❌ Error logout:", err);
    }
  }, []);

  const updateUsername = useCallback(async (username) => {
    const res = await stopAPI.post("/auth/set-username", { username });
    if (res.data.user) setUser(res.data.user);
    return res;
  }, []);

  const loginWithGoogle = useCallback(() => {
    const URL = import.meta.env.VITE_REACT_APP_BACKEND_URL || "http://localhost:3000";
    window.location.href = `${URL}/auth/google`;
  }, []);

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUsername,
    loginWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
