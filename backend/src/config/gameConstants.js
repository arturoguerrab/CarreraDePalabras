/**
 * Game Categories Configuration
 */

// Standard categories require strict Spanish validation.
export const CATEGORIES = [
  "Pais", "Animal", "Fruta/Verdura", "Planta", "Parte del cuerpo",
  "Color", "Instrumento musical", "Deporte", "Alimento",
  "Profesión", "Objeto cotidiano"
];

// Flexible categories allow for original language names (e.g., Movies in English).
export const CATEGORIES_FLEXIBLE = [
  "Ciudad", "Nombre de persona", "Apellido", "Película", "Canción",
  "Serie de TV", "Videojuego", "Personaje animado", "Superhéroe",
  "Banda/Artista Musical", "Marcas"
];

// Combined list for general use in room initialization.
export const ALL_CATEGORIES = [...CATEGORIES, ...CATEGORIES_FLEXIBLE];