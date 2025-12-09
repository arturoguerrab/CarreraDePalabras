import axios from "axios";

const api = axios.create({
	baseURL: "http://localhost:3000", // La URL base de tu backend
	withCredentials: true, // Asegura que las cookies de sesión se envíen con cada petición
});

export default api;
