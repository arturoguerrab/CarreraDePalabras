import axios from "axios";

const api = axios.create({
	baseURL: "https://ptc2l5jk-3000.usw3.devtunnels.ms", // La URL base de tu backend
	withCredentials: true, // Asegura que las cookies de sesión se envíen con cada petición
});

export default api;
