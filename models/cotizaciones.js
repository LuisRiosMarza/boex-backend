const mongoose = require('mongoose');

const cotizacionSchema = new mongoose.Schema({
  id: { type: String, required: true },           // ID de la cotización
  fecha: { type: String, required: true },          // Fecha de la cotización
  hora: { type: String, required: true },         // Hora de la cotización
  dateUTC: { type: Date, required: true },        // Fecha en UTC
  cotization: { type: Number, required: true },   // Valor de la cotización
  codempresa: { type: String, required: true },   // Código de la empresa
});

module.exports = mongoose.model('Cotizacion', cotizacionSchema);
