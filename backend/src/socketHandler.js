/**
 * Maneja la lógica de eventos de Socket.IO.
 * @param {import('socket.io').Server} io - La instancia del servidor de Socket.IO.
 */
const socketHandler = (io) => {
	io.on("connection", (socket) => {
		console.log(`Un usuario conectado: ${socket.id}`);

		// --- EJEMPLO: Chat Básico ---
		// 2. El servidor escucha el evento 'enviar_mensaje' del cliente.
		socket.on("enviar_mensaje", (mensajeRecibido) => {
			console.log(`Mensaje recibido de ${socket.id}: "${mensajeRecibido}"`);

			// 3. El servidor procesa los datos y los retransmite a TODOS los clientes.
			// Usamos `io.emit` para enviar a todos, incluido el remitente.
			io.emit("nuevo_mensaje", {
				idRemitente: socket.id,
				contenido: mensajeRecibido,
				timestamp: new Date().toLocaleTimeString(),
			});
		});
		// --- FIN DEL EJEMPLO ---

		socket.on("disconnect", () => {
			console.log(`Usuario desconectado: ${socket.id}`);
			// Opcional: notificar a otros que un usuario se fue.
			io.emit("nuevo_mensaje", {
				idRemitente: "Servidor",
				contenido: `El usuario ${socket.id} se ha desconectado.`,
				timestamp: new Date().toLocaleTimeString(),
			});
		});
	});
};

export default socketHandler;