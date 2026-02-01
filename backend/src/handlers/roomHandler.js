import * as roomService from "../services/roomService.js";

// Emite la lista de jugadores a la sala - GameContext
export const emitPlayerList = (io, roomId, players) => {
  io.to(roomId).emit(
    "update_player_list",
    players.map((p) => ({
      email: p.email,
      displayName: p.username || p.firstName || p.email,
      ready: p.ready,
    })),
  );
};

// Creacion de una sala
export const handleCreateRoom = (io, socket) => {
  const user = socket.request.user;

  if (!user) {
    socket.emit("error_joining", "Usuario no autenticado"); //Emite que el user no esta auth - GameContext
    return;
  }

  const roomId = roomService.createRoom(user, socket.id);
  socket.join(roomId);
  const room = roomService.getRoom(roomId);

  emitPlayerList(io, roomId, room.players);
  socket.emit("room_created", roomId); //Emite room creada - Game Context
};

// Jugador se une a una sala
export const handleJoinRoom = (io, socket, { room_id }) => {
  const user = socket.request.user;

  if (!user) {
    socket.emit("error_joining", "Usuario no autenticado"); //Emite que el user no esta auth - GameContext
    return;
  }

  const result = roomService.joinRoom(room_id, user, socket.id);
  if (result.error) {
    return socket.emit("error_joining", result.error);
  }

  socket.join(room_id);
  socket.emit("joined_room", room_id); //Emite ingreso a la room - Game Context
  emitPlayerList(io, room_id, result.room.players);
};

// Jugador abandonando la partida voluntariamente
export const handleLeaveRoom = (
  io,
  socket,
  { room_id },
  checkRoundCompleteCallback,
) => {
  const room = roomService.removePlayer(room_id, socket.id);
  if (room) {
    socket.leave(room_id);
    emitPlayerList(io, room_id, room.players);
    if (checkRoundCompleteCallback) checkRoundCompleteCallback(room_id);
  }
};

// Jugador abandonando la partida involuntariamente
export const handleDisconnect = (io, socket, checkRoundCompleteCallback) => {
  const result = roomService.removePlayerBySocketId(socket.id);
  if (result) {
    const { roomId, room } = result;
    emitPlayerList(io, roomId, room.players);
    if (checkRoundCompleteCallback) checkRoundCompleteCallback(roomId);
  }
};
