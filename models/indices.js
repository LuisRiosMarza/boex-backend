// BOEX-backend/models/indice.js
const mongoose = require('mongoose');

const IndiceSchema = new mongoose.Schema({
  code: { type: String, required: false },        // Código del indice
  name: { type: String, required: false },     // Nombre del indice
});

module.exports = mongoose.model('Indice', IndiceSchema);
/**
 * {
    "code": "JGE",
    "name": "Jose G"
}
 */
