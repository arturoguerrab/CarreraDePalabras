const SetUsernameView = ({
  username,
  setUsername,
  error,
  loading,
  handleSubmit,
  handleLogout,
}) => {
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

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] rounded-3xl p-8 relative text-center">
          <h1 className="text-xl text-black mb-4 uppercase drop-shadow-sm">
            ¡CASI LISTO!
          </h1>
          <p className="text-[10px] text-gray-500 mb-6 uppercase leading-relaxed">
            Para jugar, necesitas un nombre de usuario único.
          </p>

          {/* Error de Nickname */}
          {error && (
            <div className="mb-6 p-2 bg-red-100 border-4 border-black text-red-600 text-[10px] uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-100 border-4 border-black p-3 text-black text-base md:text-sm focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all outline-none rounded-xl placeholder-gray-400"
              placeholder="Elige tu Nickname"
              required
              autoFocus
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 bg-[#facc15] border-4 border-black text-black text-xs uppercase hover:bg-yellow-300 rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Guardando..." : "Comenzar a jugar"}
            </button>
          </form>

          {/* Opción de Salir */}
          <div className="mt-8 pt-4 border-t-4 border-black border-dashed">
            <button
              onClick={handleLogout}
              className="text-[10px] text-gray-500 hover:text-red-500 underline decoration-wavy decoration-2 uppercase"
            >
              Cancelar y Salir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetUsernameView;
