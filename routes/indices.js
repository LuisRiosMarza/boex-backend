// BOEX-backend/routes/indices.js
const express = require('express');
const router = express.Router();
const {
  obtenerIndices,
  crearIndice,
  actualizarIndice,
  eliminarIndice,
} = require('../controllers/indicesController');

// Obtener todos los indices
router.get('/', obtenerIndices);

// Crear un nuevo índice
router.post('/', crearIndice);

// Actualizar un índice
router.put('/:id', actualizarIndice);

// Eliminar un índice
router.delete('/:id', eliminarIndice);

module.exports = router;
