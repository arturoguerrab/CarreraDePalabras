/**
 * Categorías que requieren validación estricta en español (Diccionario).
 */
export const CATEGORIES = [
  "Pais",
  "Animal",
  "Fruta/Verdura",
  "Flor/Planta",
  "Parte del cuerpo",
  "Color",
  "Instrumento musical",
  "Deporte",
  "Comida/Plato",
  "Profesión/Oficio",
  "Objeto cotidiano",
];

/**
 * Categorías flexibles que admiten nombres propios, inglés o idiomas originales.
 */
export const CATEGORIES_FLEXIBLE = [
  "Ciudad",
  "Nombre de persona",
  "Apellido",
  "Película",
  "Canción",
  "Serie de TV",
  "Videojuego",
  "Personaje animado",
  "Superhéroe",
  "Banda/Artista Musical",
  "Marcas",
];

/**
 * Lista maestra unificada.
 */
export const ALL_CATEGORIES = [...CATEGORIES, ...CATEGORIES_FLEXIBLE];