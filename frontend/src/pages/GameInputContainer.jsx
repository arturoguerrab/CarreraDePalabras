import React, { useState, useEffect } from "react";
import GameInputView from "./GameInputView";
import StopContainer from "./StopContainer";
const categorias = ["Color", "Ciudad", "Animal", "Nombre", "Fruta"];
const letraInicial = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

const GameInputContainer = () => {
  const [playerInfo, setPlayerInfo] = useState({});
  const [letra, setLetra] = useState(() => {
    const randomIndex = Math.floor(Math.random() * letraInicial.length);
    return letraInicial[randomIndex];
  });
  const [resultsOk, setResultsOk] = useState(false);

  const promtEntry = [{ letra: letra }];

  const createPromtObject = (prop) => {
    prop.forEach((element) => {
      promtEntry.push(element);
    });
  };
  console.log(promtEntry);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Aquí transformamos el estado simple al formato complejo que necesitas para tu Prompt
    const datosParaEnviar = categorias.map((cat) => ({
      categoria: cat,
      respuesta: [
        {
          id_jugador: 1, // ID Hardcodeado o traido de props
          palabra: playerInfo[cat] || "", // Obtenemos el valor del estado o string vacío
        },
      ],
    }));

    createPromtObject(datosParaEnviar);
    setResultsOk(true)

    // aquí llamarías a tu función de enviar datos
  };

  const handleInputChange = (categoria, valor) => {
    setPlayerInfo((prev) => ({
      ...prev,
      [categoria]: valor, // USA EL NOMBRE DE LA CATEGORÍA COMO CLAVE
    }));
  };

  return !resultsOk ? (
    <GameInputView
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
      letra={letra}
    />
  ) : (
    <StopContainer entradaDatos={promtEntry} />
  );
};

export default GameInputContainer;
