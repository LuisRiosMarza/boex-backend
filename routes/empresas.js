// BOEX-backend/routes/cotizaciones.js
const express = require('express');
const router = express.Router();
const {
  obtenerEmpresas,
  crearEmpresa,
  actualizarEmpresa,
  eliminarEmpresa,
  obtenerEmpresaPorCodigo,
} = require('../controllers/empresasController');

// Obtener todas las cotizaciones
router.get('/', obtenerEmpresas);

// Ruta para obtener cotizaciones por empresa
router.get('/:empresa', obtenerEmpresaPorCodigo);

// Crear una nueva cotización
router.post('/', crearEmpresa);

// Actualizar una cotización
router.put('/:id', actualizarEmpresa);

// Eliminar una cotización
router.delete('/:id', eliminarEmpresa);

module.exports = router;
