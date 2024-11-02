// BOEX-backend/models/cotizacion.js
const mongoose = require('mongoose');

const cotizacionSchema = new mongoose.Schema({
  empresa: { type: String, required: true },
  precio: { type: Number, required: true },
  fecha: { type: Date, required: true },
});

module.exports = mongoose.model('Cotizacion', cotizacionSchema);
