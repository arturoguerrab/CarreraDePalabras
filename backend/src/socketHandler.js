import { nanoid } from "nanoid";

/**
 * Maneja la lógica de eventos de Socket.IO.
 * @param {import('socket.io').Server} io - La instancia del servidor de Socket.IO.
 */
const socketHandler = (io) => {
  // Podrías usar una estructura más robusta para almacenar las salas en producción
  const rooms = {};

  io.on("connection", (socket) => {
    console.log(`Un usuario conectado: ${socket.id}`);

    // --- Lógica de Salas para el Juego "Stop" ---

    // Evento para crear una nueva sala de juego
    socket.on("create_room", (user) => {
      const roomId = nanoid(4); // Genera un ID de sala corto y único (ej: 'A1b2C3')
      socket.join(roomId);
      rooms[roomId] = {
        // Guardamos un objeto por jugador para tener más datos
        players: [{ id: socket.id, email: user.email }],
      };

      console.log(`Usuario ${user.email} creó y se unió a la sala ${roomId}`);
      io.to(roomId).emit("update_player_list", rooms[roomId].players.map(p => p.email));
      // Notifica al creador que la sala fue creada con éxito
      socket.emit("room_created", roomId);
    });

    // Evento para unirse a una sala existente
    socket.on("join_room", (data) => {
      const { room_id, user } = data;

      // Verifica si la sala existe
      if (rooms[room_id]) {
        socket.join(room_id);

        // Lógica para evitar duplicados
        const playerIndex = rooms[room_id].players.findIndex(p => p.email === user.email);

        if (playerIndex !== -1) {
          // Si el jugador ya existe (ej. por un refresco de página), solo actualizamos su socket.id
          rooms[room_id].players[playerIndex].id = socket.id;
        } else {
          // Si es un jugador nuevo en la sala, lo añadimos
          rooms[room_id].players.push({ id: socket.id, email: user.email });
        }

        console.log(`Usuario ${user.email} se unió a la sala ${room_id}`);

        // Notifica al jugador que se unió con éxito
        socket.emit("joined_room", room_id);

        // Envía la lista actualizada de jugadores a todos en la sala
        io.to(room_id).emit("update_player_list", rooms[room_id].players.map(p => p.email));
      } else {
        // Si la sala no existe, notifica al jugador
        socket.emit("error_joining", "La sala no existe.");
      }
    });

    // Evento de ejemplo para una acción dentro del juego (ej. alguien dice "Stop")
    socket.on("game_action", ({ roomId, action }) => {
      console.log(`Acción '${action}' en la sala ${roomId} por ${socket.id}`);
      // Retransmite la acción a TODOS en la sala, incluido quien la envió
      io.to(roomId).emit("action_received", { player: socket.id, action });
    });

    // Evento para salir de una sala voluntariamente (navegación)
    socket.on("leave_room", (data) => {
      const { room_id, user } = data;
      if (rooms[room_id] && user) {
        socket.leave(room_id);
        console.log(`Usuario ${user.email} salió voluntariamente de la sala ${room_id}`);

        // Eliminar al jugador de la lista
        const playerIndex = rooms[room_id].players.findIndex(p => p.id === socket.id);
        if (playerIndex !== -1) {
          rooms[room_id].players.splice(playerIndex, 1);
        }

        io.to(room_id).emit("update_player_list", rooms[room_id].players.map(p => p.email));
      }
    });

    socket.on("disconnect", () => {
      console.log(`Usuario desconectado: ${socket.id}`);
      // Buscar en todas las salas si este socket.id estaba en alguna
      for (const roomId in rooms) {
        const room = rooms[roomId];
        const playerIndex = room.players.findIndex(
          (player) => player.id === socket.id
        );

        // Si encontramos al jugador en la sala
        if (playerIndex !== -1) {
          const disconnectedPlayer = room.players[playerIndex];
          console.log(`Jugador ${disconnectedPlayer.email} salió de la sala ${roomId}`);

          // Eliminar al jugador de la lista
          room.players.splice(playerIndex, 1);

          // Notificar a los jugadores restantes en la sala
          io.to(roomId).emit("update_player_list", room.players.map(p => p.email));
          break; // Salimos del bucle una vez encontrado y eliminado
        }
      }
    });
  });
};

export default socketHandler;
