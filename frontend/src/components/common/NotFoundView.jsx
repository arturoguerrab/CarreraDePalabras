import { Link } from "react-router-dom";

/**
 * Pantalla de error 404 para rutas inexistentes.
 */
const NotFoundView = () => {
  return (
    <div className="min-h-screen bg-[#6366f1] flex items-center justify-center px-4 py-12 font-['Press_Start_2P'] relative overflow-hidden">
      {/* Fondo Cuadriculado */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* Decoración Arcade */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-[#ef4444] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transform -rotate-12"></div>
      <div className="absolute bottom-20 right-10 w-24 h-8 bg-[#fbbf24] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transform rotate-6"></div>
      <div className="absolute top-40 right-20 w-12 h-12 bg-[#4ade80] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transform rotate-45"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] rounded-[2rem] p-8 relative text-center">
          <div className="text-9xl mb-8 select-none">👾</div>
          <h1 className="text-4xl text-black mb-4 uppercase drop-shadow-sm font-bold">
            404
          </h1>
          <p className="text-[10px] text-gray-400 mb-10 uppercase leading-relaxed tracking-widest">
            Página no encontrada
          </p>

          <Link
            to="/lobby"
            className="block w-full py-4 bg-[#3b82f6] border-4 border-black text-white text-[10px] uppercase hover:bg-blue-400 rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-bold"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundView;
