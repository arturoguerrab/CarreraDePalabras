import ValidatedResponse from "../models/validatedResponseModel.js";
import { CATEGORIES, CATEGORIES_FLEXIBLE } from "../config/gameConstants.js";
import { GoogleGenAI } from "@google/genai";

export const processRoundResults = async (io, roomId, room) => {
  try {
    room.isCalculating = true;
    io.to(roomId).emit("calculating_results");

    const {
      currentLetter,
      currentCategories = [],
      players,
      roundData,
      config,
      scores,
    } = room;
    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Mapear respuestas de jugadores
    // OPTIMIZADO: Usamos un Map para una búsqueda instantánea de las respuestas de cada jugador.
    const roundDataMap = new Map(roundData.map(r => [r.playerId, r.answers]));
    const playerResponses = players.map(p => ({
      id: p.id,
      name: p.username || p.firstName || "Jugador",
      answers: roundDataMap.get(p.id) || {},
    }));

    // 2. Recolectar palabras únicas para validar
    const uniqueWordsMap = new Map(); // Key: "CAT|word" -> { w, c }
    const validationResults = new Map(); // Key: "CAT|word" -> { v, m }

    currentCategories.forEach((cat) => {
      playerResponses.forEach((p) => {
        const rawWord = (p.answers[cat] || "").trim();
        if (rawWord) {
          const key = `${cat}|${rawWord.toLowerCase()}`;
          uniqueWordsMap.set(key, { w: rawWord, c: cat });
        }
      });
    });

    // 3. Consultar Caché (MongoDB)
    if (uniqueWordsMap.size > 0) {
      const queries = Array.from(uniqueWordsMap.values()).map((i) => ({
        category: i.c,
        word: i.w.toLowerCase(),
      }));
      const cached = await ValidatedResponse.find({
        letter: currentLetter,
        $or: queries,
      });

      cached.forEach((doc) => {
        validationResults.set(`${doc.category}|${doc.word}`, {
          v: doc.isValid ? doc.score || 1 : 0,
          m: doc.reason,
        });
      });
    }

    // 4. Preparar faltantes para IA
    const missingForAI = {};
    uniqueWordsMap.forEach(({ w, c }, key) => {
      if (!validationResults.has(key)) {
        if (!missingForAI[c]) missingForAI[c] = [];
        missingForAI[c].push(w);
      }
    });

    // 5. Consultar IA (Simplificado: Sin schemas complejos)
    if (Object.keys(missingForAI).length > 0 && apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
# ROLE
Expert & Witty Judge for the Spanish game "STOP".

# CONTEXT
- Target Letter: '${currentLetter}'
- Strictly Spanish Categories: ${CATEGORIES.join(", ")}
- Flexible Categories (English/Original Names allowed): ${CATEGORIES_FLEXIBLE.join(
        ", "
      )}

# VALIDATION RULES
1. **Letter Check**: Word must start with '${currentLetter}'.
   - Ignore accents (Á=A).
   - IMPORTANT: In 'Flexible Categories', IGNORE leading articles (El, La, Los, Las, Un, Una, The, A, An). 
     *Example: If letter is 'M', "The Matrix" is VALID (v: 1.0).*
2. **Category Logic**:
   - **Strict Categories**: Must be valid words in Spanish.
   - **Flexible Categories**: Accept names in English, Spanish, or original language (Cities, Movies, Brands, etc.).
3. **Scoring (v)**:
   - v=1.0: Correct word, starts with letter, belongs to category.
   - v=0.5: Minor typo or phonetic error (B/V, S/C/Z, H-missing), but word is obvious.
   - v=0.0: Wrong letter, fake word, wrong category, or empty.

# OUTPUT INSTRUCTIONS
- Format: Strictly minified JSON.
- No markdown code blocks, no preamble.
- Message 'm': Witty, funny, very short, and in SPANISH.
- **CRITICAL**: You MUST return a result for EVERY word in the input data. Do not skip any.

# INPUT DATA
${JSON.stringify(missingForAI)}

# OUTPUT STRUCTURE
{ 
  "categoryName": [{ "w": "palabraOriginal", "v": number, "m": "mensaje" }] 
}
`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash", // OPTIMIZADO: Usamos un modelo oficial, rápido y estable.
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: {
            temperature: 0.1, // Temperatura baja para mayor consistencia
            responseMimeType: "application/json",
          },
        });

        const text = response.text || "{}";
        // Limpieza básica por si la IA incluye bloques de código markdown
        const cleanJson = text.replace(/```json|```/g, "").trim();
        const aiData = JSON.parse(cleanJson);
        const newValidations = [];

        // OPTIMIZADO: Usamos un Map para procesar la respuesta de la IA eficientemente.
        // Esto evita bucles anidados y búsquedas lentas (find).
        const aiResultsMap = new Map();
        for (const cat in aiData) {
          if (Array.isArray(aiData[cat])) {
            for (const result of aiData[cat]) {
              if (result.w) {
                const key = `${cat}|${normalize(result.w)}`;
                aiResultsMap.set(key, result);
              }
            }
          }
        }

        Object.keys(missingForAI).forEach(cat => {
          const sentWords = missingForAI[cat] || [];
          sentWords.forEach((sentWord) => {
            const sentLower = sentWord.toLowerCase();
            const normalizedKey = `${cat}|${normalize(sentWord)}`;
            
            const match = aiResultsMap.get(normalizedKey);
            const val = match ? { v: match.v, m: match.m } : { v: 0, m: "No validado" };
            
            validationResults.set(`${cat}|${sentLower}`, val);

            if (match) {
              newValidations.push({
                category: cat, letter: currentLetter, word: sentLower,
                isValid: val.v > 0, score: val.v, reason: val.m,
              });
            }
          });
        });

        // OPTIMIZADO: Guardamos en caché en segundo plano para no bloquear la respuesta al usuario.
        if (newValidations.length) {
          ValidatedResponse.insertMany(newValidations, { ordered: false })
            .catch(err => console.error("Error guardando en caché:", err));
        }
      } catch (e) {
        console.error("AI Error:", e);
      }
    }

    // 6. Calcular Puntajes y Estructurar Respuesta
    const results = currentCategories.map((cat) => {
      const answers = playerResponses.map((p) => {
        const word = (p.answers[cat] || "").trim();
        const key = `${cat}|${word.toLowerCase()}`;
        const val = word
          ? validationResults.get(key) || { v: 0, m: "Pendiente" }
          : { v: 0, m: "Vacío" };

        return {
          nombre: p.name,
          palabra: word,
          es_valida: val.v > 0,
          scoreModifier: val.v,
          mensaje: val.m,
          puntos: 0,
        };
      });

      // Regla de repetidos (50 vs 100)
      const counts = {};
      answers.forEach((a) => {
        if (a.es_valida) {
          const w = a.palabra.toLowerCase();
          counts[w] = (counts[w] || 0) + 1;
        }
      });

      answers.forEach((a) => {
        if (a.es_valida) {
          const isRepeated = counts[a.palabra.toLowerCase()] > 1;
          a.puntos = (isRepeated ? 50 : 100) * a.scoreModifier;
          scores[a.nombre] = (scores[a.nombre] || 0) + a.puntos;
        }
      });

      return { categoria: cat, respuestas: answers };
    });

    // 7. Finalizar Ronda
    const isGameOver = config.currentRound >= config.totalRounds;

    io.to(roomId).emit("round_results", {
      results,
      scores,
      isGameOver,
      round: config.currentRound,
      totalRounds: config.totalRounds,
    });

    if (!isGameOver) config.currentRound++;
    else room.isPlaying = false;

    room.roundData = [];
  } catch (error) {
    console.error("Critical Error in Judge:", error);
    io.to(roomId).emit("error_joining", "Error calculando resultados.");
  } finally {
    room.isCalculating = false;
  }
};

const normalize = (str) =>
  str
    ? str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
    : "";
