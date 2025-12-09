# Backend (CarreraDePalabras)

Configuración rápida para la conexión a MongoDB y arranque del servidor.

1) Variables de entorno

- Copia `backend/.env.example` a `backend/.env` y ajusta los valores.
- Para usar la base de datos `miBase` en tu máquina local, el `.env` puede contener:

```
MONGO_DB_KEY=mongodb://localhost:27017/miBase
```

O usar las partes separadas (si prefieres):

```
MONGO_HOST=127.0.0.1
MONGO_PORT=27017
MONGO_DB_NAME=miBase
```

2) Arrancar el servidor

Desde la carpeta `backend`:

```powershell
cd 'c:\Users\ag\Desktop\CarreraDePalabras\backend'
npm install
npm run dev
```

3) Comprobación

- En la consola del backend aparecerá un mensaje indicando la URI usada. Si la URI no incluye `/nombreDB`, MongoDB usa por defecto la base `test`.
- Si usas credenciales o Atlas, usa la URI completa en `MONGO_DB_KEY` (no comites credenciales al repositorio).

4) Notas sobre CORS

- El servidor ya está configurado para aceptar peticiones desde `http://localhost:5173` (sin barra final). Si hay problemas CORS, revisa `backend/src/app.js`.
