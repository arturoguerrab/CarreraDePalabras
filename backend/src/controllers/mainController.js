
export const saludo = async (req, res) => {
  //---------------LOGICA----------------------
  const { nombre } = req.params;

  //---------------RESPUESTA-------------------
  return res
    .status(200)
    .send(`¡Hola querido, ${nombre}! Bienvenido a la API moderna.`);
};

export const inicio = async (req, res) => {
  res.status(200).json({
    message: "¡Servidor Express inicio!",
    environment: process.env.NODE_ENV || "development",
  });
};

