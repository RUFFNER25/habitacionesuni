# Sistema de Alquiler de Habitaciones para Estudiantes

Sistema simple para que estudiantes universitarios puedan visualizar y consultar habitaciones disponibles para alquilar.

## Características

- ✅ Visualización de todas las habitaciones disponibles
- ✅ Detalles completos de cada habitación (descripción, precio, qué incluye, ubicación)
- ✅ Backend robusto con Express.js y SQLite
- ✅ API RESTful bien estructurada
- ✅ Frontend básico y funcional

## Tecnologías Utilizadas

- **Backend**: Node.js + Express.js
- **Base de Datos**: SQLite
- **Frontend**: HTML, CSS, JavaScript vanilla

## Instalación

1. Instalar las dependencias:
```bash
npm install
```

2. Crear la base de datos y poblar con las 6 habitaciones de ejemplo:
```bash
npm run seed
```

3. Iniciar el servidor:
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
habitaciones-uni/
├── database.js          # Configuración y funciones de SQLite
├── server.js            # Servidor Express principal
├── seed.js              # Script para poblar la base de datos
├── routes/
│   └── habitaciones.js # Rutas API para habitaciones
├── public/
│   ├── index.html       # Frontend básico
│   ├── style.css        # Estilos
│   └── app.js           # Lógica del frontend
└── package.json
```

## API Endpoints

### GET /api/habitaciones
Obtiene todas las habitaciones disponibles.

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "titulo": "Habitación Individual - Centro",
      "descripcion": "...",
      "precio": 350.00,
      "incluye": "Cama individual, escritorio...",
      "ubicacion": "Calle Principal 123, Centro",
      "disponible": 1,
      "imagen_url": "...",
      "created_at": "..."
    }
  ],
  "count": 6
}
```

### GET /api/habitaciones/:id
Obtiene los detalles de una habitación específica.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "titulo": "Habitación Individual - Centro",
    "descripcion": "...",
    "precio": 350.00,
    "incluye": "Cama individual, escritorio...",
    "ubicacion": "Calle Principal 123, Centro",
    "disponible": 1,
    "imagen_url": "...",
    "created_at": "..."
  }
}
```

## Base de Datos

La base de datos SQLite se crea automáticamente al ejecutar `npm run seed` o al iniciar el servidor por primera vez.

**Tabla: habitaciones**
- `id` (INTEGER PRIMARY KEY)
- `titulo` (TEXT)
- `descripcion` (TEXT)
- `precio` (REAL)
- `incluye` (TEXT)
- `ubicacion` (TEXT)
- `disponible` (INTEGER, 1 = disponible, 0 = no disponible)
- `imagen_url` (TEXT)
- `created_at` (DATETIME)

## Notas

- El frontend es básico e intencionalmente simple, ya que será mejorado por otro desarrollador.
- Las habitaciones se crean directamente desde el código (no hay panel de administración).
- Para recrear las habitaciones, elimina el archivo `habitaciones.db` y ejecuta `npm run seed` nuevamente.

