const express = require("express");
const cors = require("cors");
const path = require("path");
const { initDatabase } = require("./database");
const habitacionesRoutes = require("./routes/habitaciones");
const alquilerRoutes = require("./routes/alquiler");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS (permite Vite en 5173/5174 + otros puertos típicos)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:8080",
];

app.use(
  cors({
    origin: (origin, cb) => {
      // Permite requests sin Origin (Postman/curl)
      if (!origin) return cb(null, true);

      if (allowedOrigins.includes(origin)) return cb(null, true);

      return cb(new Error("CORS bloqueado: " + origin));
    },
    credentials: true,
  })
);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend (si usas /public)
app.use(express.static(path.join(__dirname, "public")));

// Rutas API
app.use("/api/habitaciones", habitacionesRoutes);
app.use("/api/alquiler", alquilerRoutes);

// Ruta raíz - servir el frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    error: err.message,
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
    console.error("Error al inicializar el servidor:", error);
    process.exit(1);
  }
}

startServer();
