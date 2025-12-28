import axios from "axios";

const api = axios.create({
	baseURL: "https://3wtqt4n2-3000.brs.devtunnels.ms", // La URL base de tu backend
	withCredentials: true, // Asegura que las cookies de sesión se envíen con cada petición
});

export default api;
