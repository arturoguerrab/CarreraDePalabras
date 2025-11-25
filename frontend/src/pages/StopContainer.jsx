import StopView from "./StopView.jsx";
import { GoogleGenAI } from "@google/genai";
import { useEffect, useRef, useState } from "react";

const StopContainer = () => {
  const [visual, setVisual] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const ENTRADA_DATOS = [
    {
      categoria: "Cosas que puedes hacer en el parque",
      respuesta: [
        { id_jugador: 1, palabra: "dormir" },
        { id_jugador: 2, palabra: "bailar" },
        { id_jugador: 3, palabra: "pelear" },
        { id_jugador: 4, palabra: " " },
      ],
    },
    {
      categoria: "Fruta",
      respuesta: [
        { id_jugador: 1, palabra: "Anan" },
        { id_jugador: 2, palabra: "Aguaca" },
        { id_jugador: 3, palabra: "albaricoque" },
        { id_jugador: 4, palabra: "Manzana" },
      ],
    },
    {
      categoria: "Pokemon",
      respuesta: [
        { id_jugador: 1, palabra: "picachu" },
        { id_jugador: 2, palabra: "tortuga" },
        { id_jugador: 3, palabra: "chikorita" },
        { id_jugador: 4, palabra: "ash" },
      ],
    },
  ];

  // Solución para evitar la doble llamada en Strict Mode (propiedad useRef)
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    // Evita la doble ejecución en modo de desarrollo
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;

    const validarRespuestas = async () => {
      setLoading(true);
      setError(null);

      const entradaJSON = JSON.stringify(ENTRADA_DATOS);

      const prompt = `
        Actúa como un juez del juego 'STOP' (Tutti Frutti).
        
        DATOS DE ENTRADA:
        ${entradaJSON}

        INSTRUCCIONES:
        1. Valida si la 'palabra' corresponde a la 'categoria'.
        2. Sé flexible con ortografía (ej: "picachu" = "Pikachu", "anan" = "Ananá").
        3. Si la palabra está incompleta se rechaza.
        4. Palabras vacías o espacios son inválidas.

        SALIDA OBLIGATORIA:
        Devuelve ÚNICAMENTE un JSON válido.
        [
          {
            "categoria": "Nombre Categoria",
            "respuestas": [
              {
                "id_jugador": number,
                "palabra": "string",
                "es_valida": boolean,
                "mensaje": "Explicacion divertida de máx 12 palabras."
              }
            ]
          }
        ]
      `;

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) throw new Error("Respuesta vacía de la IA");

        // Limpieza robusta del JSON
        const cleanJson = textResponse
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        const parsedData = JSON.parse(cleanJson);

        setVisual(parsedData);
      } catch (err) {
        console.error("Error en validación:", err);
        setError("Error al conectar con el Juez IA.");
      } finally {
        setLoading(false);
      }
    };

    validarRespuestas();
  }, []); // El effect solo se ejecuta al montar

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-900 mb-3 tracking-tight">
            🛑 Resultados 🛑 
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Detalle por categoria
          </p>
        </header>

        {/* Renderiza el componente visual, pasándole solo los datos y estados */}
        <StopView visual={visual} loading={loading} error={error} />
      </div>
    </div>
  );
};

export default StopContainer;
