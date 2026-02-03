import Room from "../models/roomModel.js";
import logger from "../utils/logger.js";

// Configuración de tiempos
const STALE_THRESHOLD_MS = 60 * 60 * 1000; // 1 Hora de inactividad
const CLEANUP_INTERVAL_MS = 15 * 60 * 1000; // Ejecutar cada 15 minutos

export const cleanupStaleRooms = async () => {
	try {
		const now = Date.now();
		const staleThreshold = new Date(now - STALE_THRESHOLD_MS);
		const emptyRoomThreshold = new Date(now - 5 * 60 * 1000); // 5 minutos de gracia para salas vacías

		const resultEmpty = await Room.deleteMany({
			players: { $size: 0 },
			updatedAt: { $lt: emptyRoomThreshold },
		});

		const resultStale = await Room.deleteMany({
			updatedAt: { $lt: staleThreshold },
		});

		const totalDeleted = resultEmpty.deletedCount + resultStale.deletedCount;

		if (totalDeleted > 0) {
			logger.info(
				`Limpieza automática: Se eliminaron ${resultEmpty.deletedCount} salas vacías huérfanas y ${resultStale.deletedCount} salas inactivas.`,
			);
		}
	} catch (error) {
		logger.error("Error durante la limpieza de salas:", error);
	}
};

export const startCleanupJob = () => {
	cleanupStaleRooms();

	setInterval(cleanupStaleRooms, CLEANUP_INTERVAL_MS);
	logger.info("Servicio de limpieza de salas iniciado.");
};
