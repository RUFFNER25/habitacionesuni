const express = require('express');
const router = express.Router();
const { getAllHabitaciones, getHabitacionById } = require('../database');

// GET /api/habitaciones - Obtener todas las habitaciones
router.get('/', async (req, res) => {
  try {
    const habitaciones = await getAllHabitaciones();
    res.json({
      success: true,
      data: habitaciones,
      count: habitaciones.length
    });
  } catch (error) {
    console.error('Error al obtener habitaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las habitaciones',
      error: error.message
    });
  }
});

// GET /api/habitaciones/:id - Obtener una habitación por ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de habitación inválido'
      });
    }

    const habitacion = await getHabitacionById(id);
    
    if (!habitacion) {
      return res.status(404).json({
        success: false,
        message: 'Habitación no encontrada'
      });
    }

    res.json({
      success: true,
      data: habitacion
    });
  } catch (error) {
    console.error('Error al obtener habitación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la habitación',
      error: error.message
    });
  }
});

module.exports = router;

