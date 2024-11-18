// BOEX-backend/models/empresa.js
const mongoose = require('mongoose');

const empresaSchema = new mongoose.Schema({
  codempresa: { type: String, required: true },        // Código de la empresa
  empresaNombre: { type: String, required: true },     // Nombre de la empresa
  id: { type: Number, required: false },                // ID opcional para la empresa
  cotizationInicial: { type: Number, required: true }, // Cotización inicial de la empresa
  cantidadAcciones: { type: Number, required: true },   // Cantidad de acciones de la empresa
});

module.exports = mongoose.model('Empresa', empresaSchema);
