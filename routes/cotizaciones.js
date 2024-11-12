const express = require('express');
const { obtenerCotizacionesPorEmpresa } = require('../controllers/cotizacionesController');
const router = express.Router();

// Ruta para obtener las cotizaciones por código de empresa
router.get('/:codempresa', obtenerCotizacionesPorEmpresa);

module.exports = router;
