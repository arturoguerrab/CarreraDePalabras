# Stopify v1.0 - Multiplayer AI-Powered Word Game

Stopify (anteriormente Carrera de Palabras) es una aplicación web multijugador en tiempo real inspirada en el clásico juego "Tutti Frutti" o "Stop". La plataforma permite a los usuarios crear salas privadas, competir simultáneamente y utiliza inteligencia artificial para validar las respuestas semánticamente.

## 🚀 Características Principales

* **Multijugador en Tiempo Real:** Sincronización instantánea de salas, temporizadores y eventos de juego mediante WebSockets bidireccionales.
* **Juez de IA (Gemini API):** Validación semántica automatizada de las palabras ingresadas por los usuarios según la letra y categoría.
* **Optimización de API (Caché):** Sistema de almacenamiento de respuestas validadas previamente para reducir la latencia y minimizar los costos de consumo de la IA.
* **Sistema de Impugnación (Trial System):** Lógica de votación en tiempo real donde los jugadores pueden debatir y votar si una palabra es válida o no.
* **Autenticación Segura:** Registro tradicional (JWT + bcrypt), inicio de sesión con Google OAuth 2.0 y verificación de correos (Nodemailer).
* **Seguridad:** Implementación de Helmet, CORS estricto y Rate Limiting para prevenir ataques de fuerza bruta.

## 💻 Tecnologías Utilizadas

**Frontend:**
* React.js (Vite)
* Tailwind CSS
* Socket.IO Client
* Context API (Gestión de estado global para Auth, Game, Rooms y Sockets)

**Backend:**
* Node.js & Express
* Socket.IO (Gestión de concurrencia y eventos de salas)
* MongoDB & Mongoose
* Google Gemini API (AI Judge Service)
* Passport.js (Local & Google OAuth 2.0)
* JWT & Nodemailer

## 🗺️ Roadmap y Futuras Mejoras (En progreso)

* **Migración a NestJS:** Refactorización de la arquitectura actual basada en Express hacia NestJS para aprovechar la inyección de dependencias y tipado estricto (TypeScript).
* **Caché con Redis:** Implementación de Redis para el manejo del estado efímero de las salas y almacenamiento de sesiones de WebSockets, optimizando la carga en MongoDB.
* **Containerización:** Creación de imágenes con Docker y Docker Compose para estandarizar los entornos de desarrollo y facilitar el despliegue.