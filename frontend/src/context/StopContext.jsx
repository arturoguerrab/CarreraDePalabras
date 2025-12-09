// Importaciones
import { createContext, useState, useEffect } from "react";
import stopAPI from "../stopAPI";
// Crecion del contexto
export const StopContext = createContext();

//Componente proveedor del contexto
const StopContextProvider = ({ children }) => {
	//Estados
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const checkSession = async () => {
			try {
				const response = await stopAPI.get("/auth/user");

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

	const login = async (email, password) => {
		const response = await stopAPI.post("/auth/login", { email, password });
		if (response.data.user) {
			setUser(response.data.user);
		}
		return response;
	};

	const register = async (email, password) => {
		return await stopAPI.post("/auth/register", { email, password });
	};

	const loginWithGoogle = () => {
		window.location.href = "http://localhost:3000/auth/google";
	};
  
	const logout = async () => {
		try {
			await stopAPI.get("/auth/logout"); // URL simplificada
			setUser(null);
		} catch (error) {
			console.error("Error al cerrar sesión:", error);
		}
	};

	const value = { user, isLoading, login, register, loginWithGoogle, logout };
	return <StopContext.Provider value={value}>{children}</StopContext.Provider>;
};

export default StopContextProvider;
