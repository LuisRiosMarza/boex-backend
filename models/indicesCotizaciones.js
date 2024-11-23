// BOEX-backend/models/IndiceCotizacion.js
const mongoose = require('mongoose');

const indiceCotizacionSchema = new mongoose.Schema({
  fecha: { type: String, required: true },        // Fecha del índice
  hora: { type: String, required: true },         // Hora del índice
  codigoIndice: { type: String, required: true }, // Código del índice
  valorIndice: { type: Number, required: true },  // Valor del índice
});

module.exports = mongoose.model('IndiceCotizacion', indiceCotizacionSchema);
