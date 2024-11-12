const Cotizacion = require('../models/cotizaciones');

// Controlador para obtener cotizaciones por código de empresa
const obtenerCotizacionesPorEmpresa = async (req, res) => {
  const { codempresa } = req.params; // Recibe el codempresa de los parámetros de la URL

  try {
    // Buscar cotizaciones por el código de empresa
    const cotizaciones = await Cotizacion.find({ codempresa });

    if (!cotizaciones || cotizaciones.length === 0) {
      return res.status(404).json({ message: 'No se encontraron cotizaciones para esta empresa.' });
    }

    // Responder con las cotizaciones encontradas
    res.json(cotizaciones);
  } catch (error) {
    console.error('Error al obtener cotizaciones:', error);
    res.status(500).json({ message: 'Error en el servidor al obtener cotizaciones.' });
  }
};

module.exports = { obtenerCotizacionesPorEmpresa };
