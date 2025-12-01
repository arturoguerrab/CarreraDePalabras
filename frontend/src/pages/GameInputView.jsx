import React from "react";
const categorias = ["Color", "Ciudad", "Animal", "Nombre", "Fruta"];
const GameInputView = ({ handleSubmit, handleInputChange, letra }) => {
  return (
    <div>
      {letra}
      <form
        onSubmit={handleSubmit}
        className="grid grid-rows-5 justify-items-center h-[500px] w-3/4"
      >
        {categorias.map((element) => {
          return (
            <label key={element} className="row-span-1 flex flex-col w-full items-start justify-center gap-2 text-xl">
              {element}:
              <input
                className="w-full bg-transparent border-b-2 border-black pb-1 ps-4 focus:outline-none focus:border-[#e427ab]"
                type="text"
                name={element}
                placeholder={element}
                required
                onChange={(e) => handleInputChange(element, e.target.value)}
              />
            </label>
          );
        })}
        <button className="row-span-1 w-[150px] self-center bg-gray-900 text-white hover:text-[#e427ab]">
          Stop
        </button>
      </form>
    </div>
  );
};

export default GameInputView;
