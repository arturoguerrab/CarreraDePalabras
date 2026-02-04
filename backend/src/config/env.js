import "dotenv/config";

const config = {
	PORT: process.env.PORT || 3000,
	SESSION_SECRET: process.env.SESSION_SECRET,
	CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
	MONGO_DB_URI: process.env.MONGO_DB_URI,
	NODE_ENV: process.env.NODE_ENV || "development",
	SERVER_URL: process.env.SERVER_URL || "http://localhost:3000",
	GOOGLE: {
		CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
		CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
		REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
	},
	EMAIL: {
		USER: process.env.EMAIL_USER,
		ALIAS: process.env.EMAIL_ALIAS,
	},
	GEMINI_API_KEY: process.env.GEMINI_API_KEY,
};

// Validacion de variables necesarias
const requiredVars = [
	"SESSION_SECRET",
	"MONGO_DB_URI",
	"GOOGLE_CLIENT_ID",
	"GOOGLE_CLIENT_SECRET",
	"GOOGLE_REFRESH_TOKEN",
	"EMAIL_USER",
];
const missingVars = requiredVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
	console.error(
		`Error: Las siguientes variables de entorno son obligatorias: ${missingVars.join(
			", ",
		)}`,
	);
	process.exit(1);
}

export default config;
