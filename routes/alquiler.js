const express = require("express");
const router = express.Router();
const { crearAlquiler, getAlquileres } = require("../database");

// POST /api/alquiler
router.post("/", async (req, res) => {
  try {
    const { habitacionId, estudianteNombre, estudianteDoc } = req.body;

    if (!habitacionId || !estudianteNombre || !estudianteDoc) {
      return res.status(400).json({
        success: false,
        message: "Faltan datos: habitacionId, estudianteNombre, estudianteDoc"
      });
    }

    const alquiler = await crearAlquiler({
      habitacionId: parseInt(habitacionId),
      estudianteNombre: String(estudianteNombre).trim(),
      estudianteDoc: String(estudianteDoc).trim()
    });

    if (!alquiler) {
      return res.status(400).json({
        success: false,
        message: "La habitación no existe o ya está ocupada"
      });
    }

    res.json({
      success: true,
      message: "Alquiler registrado",
      data: alquiler
    });
  } catch (error) {
    console.error("Error al alquilar:", error);
    res.status(500).json({
      success: false,
      message: "Error al registrar alquiler",
      error: error.message
    });
  }
});

// GET /api/alquiler (opcional: listar alquileres)
router.get("/", async (req, res) => {
  try {
    const alquileres = await getAlquileres();
    res.json({ success: true, data: alquileres, count: alquileres.length });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al listar alquileres", error: error.message });
  }
});

module.exports = router;
