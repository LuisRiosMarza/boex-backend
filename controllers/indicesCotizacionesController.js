// BOEX-backend/controllers/indicesCotizacionesController.js
const IndiceCotizacion = require('../models/indicesCotizaciones');

// Obtener todos los índices
const obtenerCotizacionesIndices = async (req, res) => {
  try {
    const indices = await IndiceCotizacion.find(); // Obtener todos los índices
    res.json(indices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener índices' });
  }
};

// Crear una nueva cotización de índice
const crearCotizacionIndice = async (req, res) => {
  try {
    const nuevaCotizacion = new IndiceCotizacion(req.body); // Crear la nueva cotización
    await nuevaCotizacion.save(); // Guardar en la base de datos
    res.status(201).json(nuevaCotizacion); // Devuelve la cotización creada
  } catch (error) {
    console.error(error);
    res.status(400).json({ mensaje: 'Error al crear cotización de índice', error });
  }
};

// Actualizar una cotización de índice
const actualizarCotizacionIndice = async (req, res) => {
  const { id } = req.params;
  try {
    const cotizacionActualizada = await IndiceCotizacion.findByIdAndUpdate(id, req.body, { new: true });
    if (!cotizacionActualizada) {
      return res.status(404).json({ mensaje: 'Cotización de índice no encontrada' });
    }
    res.json(cotizacionActualizada); // Devuelve la cotización actualizada
  } catch (error) {
    console.error(error);
    res.status(400).json({ mensaje: 'Error al actualizar cotización de índice', error });
  }
};

// Eliminar una cotización de índice
const eliminarCotizacionIndice = async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await IndiceCotizacion.findByIdAndDelete(id);
    if (resultado) {
      res.status(204).send(); // Responde con éxito sin contenido
    } else {
      res.status(404).json({ mensaje: 'Cotización de índice no encontrada' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar cotización de índice' });
  }
};

// Buscar cotizaciones por código de índice
const obtenerCotizacionesPorCodigoIndice = async (req, res) => {
  const { code } = req.params; // Obtener el código de índice desde los parámetros
  try {
    const cotizaciones = await IndiceCotizacion.find({ code }); // Buscar cotizaciones por código de índice
    if (cotizaciones.length === 0) {
      return res.status(404).json({ mensaje: `No se encontraron cotizaciones para el índice: ${code}` });
    }
    res.json(cotizaciones); // Devuelve las cotizaciones encontradas
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener cotizaciones por código de índice' });
  }
};

module.exports = {
  obtenerCotizacionesIndices,
  crearCotizacionIndice,
  actualizarCotizacionIndice,
  eliminarCotizacionIndice,
  obtenerCotizacionesPorCodigoIndice,
};
