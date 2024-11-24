// BOEX-backend/routes/indicesCotizacionesRoutes.js
const express = require('express');
const router = express.Router();
const { 
  obtenerCotizacionesIndices, 
  crearCotizacionIndice, 
  actualizarCotizacionIndice, 
  eliminarCotizacionIndice, 
  obtenerCotizacionesPorCodigoIndice 
} = require('../controllers/indicesCotizacionesController');

// Ruta para obtener todos los índices
router.get('/', obtenerCotizacionesIndices);

// Ruta para crear una nueva cotización de índice
router.post('/', crearCotizacionIndice);

// Ruta para actualizar una cotización de índice por ID
router.put('/:id', actualizarCotizacionIndice);

// Ruta para eliminar una cotización de índice por ID
router.delete('/:id', eliminarCotizacionIndice);

// Ruta para obtener cotizaciones por código de índice
router.get('/:code', obtenerCotizacionesPorCodigoIndice);

module.exports = router;
