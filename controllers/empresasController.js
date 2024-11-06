// BOEX-backend/controllers/empresasController.js
const Empresa = require('../models/empresas');

// Obtener todas las empresas
const obtenerEmpresas = async (req, res) => {
  try {
    const empresas = await Empresa.find();
    res.json(empresas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener empresas' });
  }
};

// Obtener empresa por código
const obtenerEmpresaPorCodigo = async (req, res) => {
  const { codempresa } = req.params; // Obtiene el código de la empresa de la ruta
  try {
    const empresa = await Empresa.findOne({ codempresa }); // Busca la empresa por su código
    if (!empresa) {
      return res.status(404).json({ mensaje: 'Empresa no encontrada' });
    }
    res.json(empresa); // Devuelve la empresa encontrada
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener la empresa' });
  }
};

// Crear una nueva empresa
const crearEmpresa = async (req, res) => {
  try {
    const nuevaEmpresa = new Empresa(req.body);
    await nuevaEmpresa.save();
    res.status(201).json(nuevaEmpresa);
  } catch (error) {
    console.error(error);
    res.status(400).json({ mensaje: 'Error al crear empresa', error });
  }
};

// Actualizar una empresa
const actualizarEmpresa = async (req, res) => {
  const { id } = req.params;
  try {
    const empresaActualizada = await Empresa.findByIdAndUpdate(id, req.body, { new: true });
    if (!empresaActualizada) {
      return res.status(404).json({ mensaje: 'Empresa no encontrada' });
    }
    res.json(empresaActualizada);
  } catch (error) {
    console.error(error);
    res.status(400).json({ mensaje: 'Error al actualizar empresa', error });
  }
};

// Eliminar una empresa
const eliminarEmpresa = async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await Empresa.findByIdAndDelete(id);
    if (resultado) {
      res.status(204).send();
    } else {
      res.status(404).json({ mensaje: 'Empresa no encontrada' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar empresa' });
  }
};

module.exports = {
  obtenerEmpresas,
  obtenerEmpresaPorCodigo,
  crearEmpresa,
  actualizarEmpresa,
  eliminarEmpresa,
};
