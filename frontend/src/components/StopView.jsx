import React from "react";

const StopView = ({ visual, loading, error }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-6"></div>
        <p className="text-xl font-semibold text-white animate-pulse">
          El Juez está deliberando...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg mt-10 p-6 bg-red-50 border border-red-200 rounded-xl text-center shadow-sm">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h3 className="font-bold text-xl text-red-800 mb-2">
          Error de Comunicación
        </h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!visual || visual.length === 0) return null;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {visual.map((bloque, idx) => (
        <section
          key={idx}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all hover:shadow-2xl"
        >
          {/* Cabecera de Categoría */}
          <div className="bg-[#1e212a] px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <h2 className="text-white font-bold text-lg uppercase tracking-wider flex items-center gap-2">
              📂 {bloque.categoria}
            </h2>
            <span className="border text-indigo-100 text-xs px-3 py-1 rounded-full font-mono">
              {bloque.respuestas.length} Respuestas
            </span>
          </div>

          {/* Grid de Respuestas */}
          <div className="p-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-[#f0f0f0]">
            {bloque.respuestas.map((item, i) => (
              <div
                key={i}
                className={`
                  relative flex flex-col justify-between p-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02]
                  ${
                    item.es_valida
                      ? "border-green-100 bg-green-50 hover:border-green-300 shadow-sm"
                      : "border-red-100 bg-red-50 hover:border-red-300 shadow-sm"
                  }
                `}
              >
                {/* ID Jugador y Estado */}
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-gray-400 bg-white px-2 py-1 rounded border border-gray-200 uppercase">
                    J-{item.id_jugador}
                  </span>
                  <div
                    className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-sm
                    ${item.es_valida ? "bg-green-500" : "bg-red-500"}
                  `}
                  >
                    {item.es_valida ? "✓" : "✕"}
                  </div>
                </div>

                {/* Palabra */}
                <h3 className="text-lg font-extrabold text-gray-800 mb-2 capitalize">
                  {item.palabra || (
                    <span className="text-gray-400 italic text-sm">
                      (Vacío)
                    </span>
                  )}
                </h3>

                {/* Mensaje de la IA */}
                <div
                  className={`mt-2 pt-2 border-t ${
                    item.es_valida ? "border-green-200" : "border-red-200"
                  }`}
                >
                  <p
                    className={`text-sm italic leading-snug ${
                      item.es_valida ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    "{item.mensaje}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default StopView;
