const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./database');
const habitacionesRoutes = require('./routes/habitaciones');
const alquilerRoutes = require('./routes/alquiler');

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));

const PORT = process.env.PORT || 3000;

// Middlewares

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'public')));

// Rutas API
app.use('/api/habitaciones', habitacionesRoutes);
app.use('/api/alquiler', alquilerRoutes);


// Ruta raíz - servir el frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: err.message
  });
});

// Inicializar base de datos y servidor
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al inicializar el servidor:', error);
    process.exit(1);
  }
}

startServer();

