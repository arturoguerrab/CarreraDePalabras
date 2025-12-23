import { customAlphabet } from "nanoid";
import "dotenv/config"; // Asegurar que las variables de entorno estén cargadas

/**
 * Maneja la lógica de eventos de Socket.IO.
 * @param {import('socket.io').Server} io - La instancia del servidor de Socket.IO.
 */
const socketHandler = (io) => {
  // Generador de IDs numéricos de 6 dígitos
  const generateRoomId = customAlphabet("0123456789", 4);

  // Podrías usar una estructura más robusta para almacenar las salas en producción
  const rooms = {};

  // Helper para programar la eliminación de la sala con un retraso (evita problemas con Strict Mode/Refrescos)
  const scheduleRoomDeletion = (roomId) => {
    if (rooms[roomId]) {
      if (rooms[roomId].deleteTimeout) clearTimeout(rooms[roomId].deleteTimeout);
      
      console.log(`Sala ${roomId} vacía. Se eliminará en 5 segundos si nadie entra.`);
      rooms[roomId].deleteTimeout = setTimeout(() => {
        if (rooms[roomId] && rooms[roomId].players.length === 0) {
          delete rooms[roomId];
          console.log(`Sala ${roomId} eliminada definitivamente.`);
        }
      }, 5000);
    }
  };

  const cancelRoomDeletion = (roomId) => {
    if (rooms[roomId] && rooms[roomId].deleteTimeout) {
      clearTimeout(rooms[roomId].deleteTimeout);
      delete rooms[roomId].deleteTimeout;
      console.log(`Eliminación de sala ${roomId} cancelada.`);
    }
  };

  io.on("connection", (socket) => {
    console.log(`Un usuario conectado: ${socket.id}`);

    // --- Lógica de Salas para el Juego "Stop" ---

    // Evento para crear una nueva sala de juego
    socket.on("create_room", (user) => {
      const roomId = generateRoomId(); // Genera un ID de sala numérico
      socket.join(roomId);
      rooms[roomId] = {
        // Guardamos un objeto por jugador para tener más datos
        players: [{ 
          id: socket.id, 
          email: user.email,
          username: user.username,
          firstName: user.firstName
        }],
        isPlaying: false,
      };

      console.log(`Usuario ${user.email} creó y se unió a la sala ${roomId}`);
      io.to(roomId).emit(
        "update_player_list",
        rooms[roomId].players.map((p) => ({
          email: p.email,
          displayName: p.username || p.firstName || p.email
        }))
      );
      // Notifica al creador que la sala fue creada con éxito
      socket.emit("room_created", roomId);
    });

    // Evento para unirse a una sala existente
    socket.on("join_room", (data) => {
      const { room_id, user } = data;

      // Verifica si la sala existe
      if (rooms[room_id]) {
        cancelRoomDeletion(room_id); // Cancelar eliminación si estaba programada

        // Lógica para evitar duplicados
        const playerIndex = rooms[room_id].players.findIndex(
          (p) => p.email === user.email
        );

        // Si la partida ya empezó y el usuario NO está en la lista (es nuevo), bloqueamos la entrada
        if (rooms[room_id].isPlaying && playerIndex === -1) {
          socket.emit("error_joining", "La partida ya ha comenzado. No puedes entrar.");
          return;
        }

        socket.join(room_id);

        if (playerIndex !== -1) {
          // Si el jugador ya existe (ej. por un refresco de página), solo actualizamos su socket.id
          rooms[room_id].players[playerIndex].id = socket.id;
        } else {
          // Si es un jugador nuevo en la sala, lo añadimos
          rooms[room_id].players.push({ 
            id: socket.id, 
            email: user.email,
            username: user.username,
            firstName: user.firstName
          });
        }

        console.log(`Usuario ${user.email} se unió a la sala ${room_id}`);

        // Notifica al jugador que se unió con éxito
        socket.emit("joined_room", room_id);

        // Envía la lista actualizada de jugadores a todos en la sala
        io.to(room_id).emit(
          "update_player_list",
          rooms[room_id].players.map((p) => ({
            email: p.email,
            displayName: p.username || p.firstName || p.email
          }))
        );
      } else {
        // Si la sala no existe, notifica al jugador
        socket.emit("error_joining", "La sala no existe.");
      }
    });

    // Evento para iniciar el juego
    socket.on("start_game", (data) => {
      const { room_id: roomId, rounds } = typeof data === 'object' ? data : { room_id: data, rounds: 5 };
      
      const room = rooms[roomId];
      if (!room) return;

      // Validar que quien inicia sea el dueño (primer jugador en la lista)
      if (room.players[0].id !== socket.id) {
        return; // Ignorar intento de inicio si no es el dueño
      }

      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const randomLetter =
        alphabet[Math.floor(Math.random() * alphabet.length)];

      // Lista maestra de categorías
      const allCategories = [
        "Color",
        "Ciudad",
        "Animal",
        "Fruta/Verdura",
        "Película",
        "Canción",
        "Marca de ropa",
        "Superhéroe",
        "Instrumento musical",
        "Serie de TV",
        "Deporte",
        "Marcas",
        "Personaje animado",
        "Videojuego",
        "Cosas que haces en el parque",
        "Cosas que llevas a la playa",
      ];

      // Seleccionar 8 categorías aleatorias
      const shuffled = allCategories.sort(() => 0.5 - Math.random());
      const selectedCategories = shuffled.slice(0, 8);

      console.log(`Juego iniciado en sala ${roomId} con letra ${randomLetter}`);

      // Inicializar datos de la ronda
      if (rooms[roomId]) {
        rooms[roomId].roundData = []; // Almacenará { playerId, answers }
        rooms[roomId].currentLetter = randomLetter;
        rooms[roomId].currentCategories = selectedCategories; // Guardar categorías de la ronda
        rooms[roomId].isPlaying = true; // Bloquear entrada a nuevos jugadores
        rooms[roomId].scores = {}; // Inicializar puntuaciones
        rooms[roomId].config = { totalRounds: rounds, currentRound: 1 };
      }

      io.to(roomId).emit("game_started", {
        letter: randomLetter,
        categories: selectedCategories,
      });
    });

    // Evento para siguiente ronda
    socket.on("next_round", (roomId) => {
      const room = rooms[roomId];
      if (room) {
        // Validar que quien inicia sea el dueño (primer jugador en la lista)
        if (room.players[0].id !== socket.id) {
          return;
        }

        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
        
        // Reutilizamos la lista de categorías
        const allCategories = ["Color", "Ciudad", "Animal", "Fruta/Verdura", "Película", "Canción", "Marca de ropa", "Superhéroe", "Instrumento musical", "Serie de TV", "Deporte", "Marcas", "Personaje animado", "Videojuego", "Cosas que haces en el parque", "Cosas que llevas a la playa"];
        const shuffled = allCategories.sort(() => 0.5 - Math.random());
        const selectedCategories = shuffled.slice(0, 8);

        room.currentLetter = randomLetter;
        room.currentCategories = selectedCategories;
        room.roundData = [];
        
        io.to(roomId).emit("game_started", {
            letter: randomLetter,
            categories: selectedCategories
        });
      }
    });

    // Evento para reiniciar el juego (volver al lobby)
    socket.on("reset_game", (roomId) => {
      const room = rooms[roomId];
      if (room) {
        // Validar que quien inicia sea el dueño (primer jugador en la lista)
        if (room.players[0].id !== socket.id) return;

        room.isPlaying = false;
        room.scores = {};
        room.roundData = [];
        
        io.to(roomId).emit("game_reset");
      }
    });

    // Evento de ejemplo para una acción dentro del juego (ej. alguien dice "Stop")
    socket.on("game_action", ({ roomId, action }) => {
      console.log(`Acción '${action}' en la sala ${roomId} por ${socket.id}`);
      // Retransmite la acción a TODOS en la sala, incluido quien la envió
      io.to(roomId).emit("action_received", { player: socket.id, action });
    });

    // Función auxiliar para verificar si todos respondieron
    const checkRoundComplete = async (roomId) => {
      const room = rooms[roomId];
      if (!room) return;

      // Evitar múltiples llamadas si ya se está calculando
      if (room.isCalculating) return;

      // Si tenemos respuestas de todos los jugadores conectados
      if (room.roundData.length >= room.players.length) {
        room.isCalculating = true; // Bloquear

        // 1. Avisar al frontend que estamos calculando (Loading)
        io.to(roomId).emit("calculating_results");

        // Usar las categorías guardadas en la sala (o fallback por seguridad)
        const categories = room.currentCategories || [
          "Color",
          "Ciudad",
          "Animal",
          "Nombre",
          "Fruta",
        ];

        // Formatear datos para el prompt del frontend
        // Estructura: [{ letra: 'A' }, { categoria: 'Color', respuesta: [...] }, ...]
        const formattedData = [{ letra: room.currentLetter }];

        categories.forEach((cat) => {
          const answersForCat = room.roundData.map((entry) => {
            const player = room.players.find((p) => p.id === entry.playerId);
            const playerName = player ? (player.username || player.firstName || player.email.split("@")[0]) : "Anon";
            return {
              nombre: playerName,
              palabra: entry.answers[cat] || "",
            };
          });

          formattedData.push({
            categoria: cat,
            respuesta: answersForCat,
          });
        });

        // --- INICIO VALIDACIÓN IA EN BACKEND ---
        const prompt = `
        Actúa como un juez del juego 'STOP' (Tutti Frutti).
        
        DATOS DE ENTRADA:
        ${JSON.stringify(formattedData)}

        INSTRUCCIONES:
        1. Valida si la 'palabra' corresponde a la 'categoria'.
        2. Valida que la 'palabra' empiece con la Letra de la ronda.
        3. Sé flexible con ortografía (ej: "picachu" = "Pikachu") solo si el error no es la primera letra.
        4. Si la palabra está incompleta siempre se rechaza.
        5. Palabras vacías o espacios son inválidas.

        SALIDA OBLIGATORIA:
        Devuelve ÚNICAMENTE un JSON válido.
        [
          {
            "categoria": "Nombre Categoria",
            "respuestas": [
              {
                "nombre": "string",
                "palabra": "string",
                "es_valida": boolean,
                "mensaje": "Explicacion divertida de máx 12 palabras."
              }
            ]
          }
        ]
        `;

        try {
          const apiKey = process.env.GEMINI_API_KEY;
          if (!apiKey)
            throw new Error("GEMINI_API_KEY no está definida en el backend");
          // Log para verificar que la key existe (mostramos solo el inicio por seguridad)
          console.log(
            `🔑 Iniciando validación con IA. Key detectada: ${apiKey.substring(
              0,
              8
            )}...`
          );

          // Usamos gemini-1.5-flash que es el modelo estable y gratuito
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }, // <-- Forzar respuesta JSON
              }),
            }
          );

          if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(
              `Error API Gemini: ${response.status} ${response.statusText} - ${errorBody}`
            );
          }

          const data = await response.json();
          const textResponse =
            data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
          const cleanJson = textResponse
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

          const parsedResults = JSON.parse(cleanJson);

          // --- SISTEMA DE PUNTUACIÓN (Backend) ---
          parsedResults.forEach(category => {
            const wordCounts = {};
            
            // 1. Contar frecuencias de palabras válidas (normalizadas)
            category.respuestas.forEach(r => {
              if (r.es_valida && r.palabra) {
                const word = r.palabra.trim().toLowerCase();
                wordCounts[word] = (wordCounts[word] || 0) + 1;
              }
            });

            // 2. Asignar puntos
            category.respuestas.forEach(r => {
              if (r.es_valida && r.palabra) {
                const word = r.palabra.trim().toLowerCase();
                // Si la palabra se repite más de una vez, 50 puntos. Si es única, 100.
                r.puntos = wordCounts[word] > 1 ? 50 : 100;
              } else {
                r.puntos = 0;
              }

              // 3. Acumular en el score global de la sala
              room.scores[r.nombre] = (room.scores[r.nombre] || 0) + r.puntos;
            });
          });

          // Verificar si el juego terminó
          const isGameOver = room.config.currentRound >= room.config.totalRounds;

          io.to(roomId).emit("round_results", {
            results: parsedResults,
            scores: room.scores,
            isGameOver: isGameOver,
            round: room.config.currentRound,
            totalRounds: room.config.totalRounds
          });

          if (!isGameOver) {
            room.config.currentRound++;
          } else {
            room.isPlaying = false; // Juego terminado
          }
          room.roundData = []; // Limpiar datos solo tras éxito
        } catch (error) {
          console.error("Error validando con IA:", error);
          io.to(roomId).emit(
            "error_joining",
            "Error al validar resultados con la IA."
          );
        } finally {
          room.isCalculating = false; // Desbloquear siempre, pase lo que pase
        }
        // --- FIN VALIDACIÓN IA ---
      }
    };

    // Alguien presionó STOP
    socket.on("stop_round", ({ roomId, answers }) => {
      const room = rooms[roomId];
      if (room) {
        // 2. Evitar duplicados: Si este socket ya envió datos, ignorar.
        if (room.roundData.find((d) => d.playerId === socket.id)) return;

        room.roundData.push({ playerId: socket.id, answers });
        // Avisar a los demás que envíen sus respuestas YA
        socket.to(roomId).emit("force_submit");
        checkRoundComplete(roomId);
      }
    });

    // Recibir respuestas forzadas de los demás
    socket.on("submit_answers", ({ roomId, answers }) => {
      const room = rooms[roomId];
      if (room) {
        // Evitar duplicados si el socket envía varias veces
        const exists = room.roundData.find((d) => d.playerId === socket.id);
        if (!exists) {
          room.roundData.push({ playerId: socket.id, answers });
          checkRoundComplete(roomId);
        }
      }
    });

    // Evento para salir de una sala voluntariamente (navegación)
    socket.on("leave_room", (data) => {
      const { room_id, user } = data;
      if (rooms[room_id] && user) {
        socket.leave(room_id);
        console.log(
          `Usuario ${user.email} salió voluntariamente de la sala ${room_id}`
        );

        // Eliminar al jugador de la lista
        const playerIndex = rooms[room_id].players.findIndex(
          (p) => p.id === socket.id
        );
        if (playerIndex !== -1) {
          rooms[room_id].players.splice(playerIndex, 1);
          
          // Si no quedan jugadores, destruir la sala
          if (rooms[room_id].players.length === 0) {
            scheduleRoomDeletion(room_id);
            return;
          }
        }

        io.to(room_id).emit(
          "update_player_list",
          rooms[room_id].players.map((p) => ({
            email: p.email,
            displayName: p.username || p.firstName || p.email
          }))
        );
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
          console.log(
            `Jugador ${disconnectedPlayer.email} salió de la sala ${roomId}`
          );

          // Eliminar al jugador de la lista
          room.players.splice(playerIndex, 1);

          // Si no quedan jugadores, destruir la sala
          if (room.players.length === 0) {
            scheduleRoomDeletion(roomId);
          } else {
            // Notificar a los jugadores restantes en la sala (el primero ahora es el nuevo dueño)
            io.to(roomId).emit(
              "update_player_list",
              room.players.map((p) => ({
                email: p.email,
                displayName: p.username || p.firstName || p.email
              }))
            );
          }
          break; // Salimos del bucle una vez encontrado y eliminado
        }
      }
    });
  });
};

export default socketHandler;
