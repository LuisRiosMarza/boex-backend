// BOEX-backend/routes/cotizaciones.js
const express = require('express');
const router = express.Router();
const {
  obtenerCotizaciones,
  crearCotizacion,
  actualizarCotizacion,
  eliminarCotizacion,
  obtenerCotizacionesPorEmpresa,
} = require('../controllers/cotizacionesController');

// Obtener todas las cotizaciones
router.get('/', obtenerCotizaciones);

// Ruta para obtener cotizaciones por empresa
router.get('/:empresa', cotizacionesController.obtenerCotizacionesPorEmpresa);

// Crear una nueva cotización
router.post('/', crearCotizacion);

// Actualizar una cotización
router.put('/:id', actualizarCotizacion);

// Eliminar una cotización
router.delete('/:id', eliminarCotizacion);

module.exports = router;
