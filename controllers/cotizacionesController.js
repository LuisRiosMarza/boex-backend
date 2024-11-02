// BOEX-backend/controllers/cotizacionesController.js
const Cotizacion = require('../models/cotizacion');

// Obtener todas las cotizaciones
const obtenerCotizaciones = async (req, res) => {
  const cotizaciones = await Cotizacion.find();
  res.json(cotizaciones);
};

// Obtener cotizaciones por empresa
const obtenerCotizacionesPorEmpresa = async (req, res) => {
  const { empresa } = req.params; // Obtiene el nombre de la empresa de la ruta
  try {
    const cotizaciones = await Cotizacion.find({ empresa }); // Busca las cotizaciones de la empresa
    console.log(cotizaciones)
    if (cotizaciones.length === 0) {
      return res.status(404).json({ message: 'No se encontraron cotizaciones para esta empresa' });
    }
    res.json(cotizaciones); // Devuelve las cotizaciones encontradas
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener cotizaciones de la empresa');
  }
};

// Crear una nueva cotización
const crearCotizacion = async (req, res) => {
  const nuevaCotizacion = new Cotizacion(req.body);
  await nuevaCotizacion.save();
  res.status(201).json(nuevaCotizacion);
};

// Actualizar una cotización
const actualizarCotizacion = async (req, res) => {
  const { id } = req.params;
  const cotizacionActualizada = await Cotizacion.findByIdAndUpdate(id, req.body, { new: true });

  if (cotizacionActualizada) {
    res.json(cotizacionActualizada);
  } else {
    res.status(404).json({ mensaje: 'Cotización no encontrada' });
  }
};

// Eliminar una cotización
const eliminarCotizacion = async (req, res) => {
  const { id } = req.params;
  const resultado = await Cotizacion.findByIdAndDelete(id);

  if (resultado) {
    res.status(204).send();
  } else {
    res.status(404).json({ mensaje: 'Cotización no encontrada' });
  }
};

module.exports = {
  obtenerCotizaciones,
  crearCotizacion,
  actualizarCotizacion,
  eliminarCotizacion,
  obtenerCotizacionesPorEmpresa,
};
