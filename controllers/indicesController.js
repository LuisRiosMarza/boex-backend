// BOEX-backend/controllers/indicesController.js
const Indice = require('../models/indices');

// Obtener todos los índices
const obtenerIndices = async (req, res) => {
  try {
    const indices = await Indice.find();
    res.json(indices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener índices' });
  }
};

// Crear un nuevo índice
const crearIndice = async (req, res) => {
  try {
    const nuevoIndice = new Indice(req.body);
    await nuevoIndice.save();
    res.status(201).json(nuevoIndice);
  } catch (error) {
    console.error(error);
    res.status(400).json({ mensaje: 'Error al crear índice', error });
  }
};

// Actualizar un índice
const actualizarIndice = async (req, res) => {
  const { id } = req.params;
  try {
    const indiceActualizado = await Indice.findByIdAndUpdate(id, req.body, { new: true });
    if (!indiceActualizado) {
      return res.status(404).json({ mensaje: 'Índice no encontrado' });
    }
    res.json(indiceActualizado);
  } catch (error) {
    console.error(error);
    res.status(400).json({ mensaje: 'Error al actualizar índice', error });
  }
};

// Eliminar un índice
const eliminarIndice = async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await Indice.findByIdAndDelete(id);
    if (resultado) {
      res.status(204).send();
    } else {
      res.status(404).json({ mensaje: 'Índice no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar índice' });
  }
};

module.exports = {
  obtenerIndices,
  crearIndice,
  actualizarIndice,
  eliminarIndice,
};
