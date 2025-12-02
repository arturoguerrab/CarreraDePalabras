import React from "react";
import TextField from "@mui/material/TextField";

const categorias = ["Color", "Ciudad", "Animal", "Nombre", "Fruta"];
const GameInputView = ({ handleSubmit, handleInputChange, letra }) => {
  const customStyles = {
    // Color del label, borde y cursor cuando NO está enfocado (por defecto)
    "& .MuiOutlinedInput-root": {
      "& .MuiInputBase-input": {
        color: "white",
      }, //
      "& fieldset": {
        borderColor: "#f0f0f0", // Borde gris/default
      },
      "&:hover fieldset": {
        borderColor: "#f0f0f0", // Borde al pasar el ratón
      },
      // Color del borde, label y cursor cuando SÍ está enfocado
      "&.Mui-focused fieldset": {
        borderColor: "#f0f0f0", // ¡Aquí defines el color deseado!
      },
    },
    "& label": {
      color: "#f0f0f0", // Color del label por defecto
      "&.Mui-focused": {
        color: "#f0f0f0", // Color del label al enfocarse
      },
    },
  };

  return (
    <div className="bg-[#090d18] h-full flex flex-col items-center">
      <div className="bg-[#1e212a] border rounded-full text-2xl shadow-[0_0_12px_2px_rgba(255,255,255,0.2)] text-white flex flex-col justify-center items-center p-10 w-8 h-8 absolute -m-12 ">
        <span className="font-light text-sm">LETRA:</span>
        <span className="font-bold uppercase">{letra}</span>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-[#1e212a] flex flex-col gap-4 items-center p-7 mx-4 rounded-xl
          shadow-[0_0_12px_4px_rgba(255,255,255,0.2)] mt-16"
      >
        {categorias.map((element) => {
          return (
            <label key={element} className="w-80 h-10 text-white">
              <TextField
                id="outlined-basic"
                type="text"
                name={element}
                label={element}
                variant="outlined"
                size="small"
                onChange={(e) => handleInputChange(element, e.target.value)}
                sx={customStyles}
                className="w-full h-full rounded-xl"
              />
              {/* <input
                className="w-full h-full text-gray-50 pl-3 border border-gray-700 rounded-xl"
                type="text"
                name={element}
                placeholder={element}
                onChange={(e) => handleInputChange(element, e.target.value)}
              /> */}
            </label>
          );
        })}
        <button className="bg-red-500 rounded-xl text-2xl text-white font-bold w-full h-12">
          ¡STOP!
        </button>
      </form>
    </div>
  );
};

export default GameInputView;
