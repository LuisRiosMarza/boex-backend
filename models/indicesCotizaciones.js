// BOEX-backend/models/IndiceCotizacion.js
const mongoose = require('mongoose');

const indiceCotizacionSchema = new mongoose.Schema({
  fecha: { type: String, required: true },        // Fecha del índice
  hora: { type: String, required: true },         // Hora del índice
  codigoIndice: { type: String, required: true }, // Código del índice
  valorIndice: { type: Number, required: true },  // Valor del índice
});

/*{
  "_id": "674138126a88c17a83cf8ffe",
  "code": "TSE",
  "fecha": "2024-01-01",
  "hora": "09:00",
  "fechaDate": "2024-01-01T00:00:00.000Z",
  "valor": 1,
  "__v": 0
},*/

module.exports = mongoose.model('IndiceCotizacion', indiceCotizacionSchema);
