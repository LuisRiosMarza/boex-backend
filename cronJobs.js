// BOEX-backend/cronJobs.js
const axios = require('axios');
const mongoose = require('mongoose');
const Empresa = require('./models/empresas');

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/boexbd', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB para cron job'))
.catch(err => console.error('Error al conectar a MongoDB:', err));

// Función para actualizar/crear empresas
const actualizarEmpresas = async () => {
  try {
    const empresasLocales = await Empresa.find({});
    const codigosLocales = empresasLocales.map(e => e.codempresa);

    for (const codempresa of codigosLocales) {
      const url = `http://ec2-54-145-211-254.compute-1.amazonaws.com:3000/empresas/${codempresa}/details`;

      try {
        const { data } = await axios.get(url);

        // Asignar valores por defecto usando if
        if (!data.empresaNombre) {
          data.empresaNombre = "Nombre desconocido";
        }
        if (data.cotizationInicial === undefined) {
          data.cotizationInicial = 0;
        }
        if (data.cantidadAcciones === undefined) {
          data.cantidadAcciones = 1;
        }

        const empresaExistente = await Empresa.findOne({ codempresa: data.codempresa });

        if (empresaExistente) {
          // Actualizar la empresa existente
          empresaExistente.empresaNombre = data.empresaNombre;
          empresaExistente.cotizationInicial = data.cotizationInicial;
          empresaExistente.id = data.id;
          empresaExistente.cantidadAcciones = data.cantidadAcciones;
          await empresaExistente.save();
          console.log(`Empresa ${data.empresaNombre} actualizada.`);
        } else {
          // Crear una nueva empresa si no existe
          await Empresa.create({
            codempresa: data.codempresa,
            empresaNombre: data.empresaNombre,
            id: data.id,
            cotizationInicial: data.cotizationInicial,
            cantidadAcciones: data.cantidadAcciones,
          });
          console.log(`Empresa ${data.empresaNombre} creada.`);
        }
      } catch (error) {
        console.log(`Empresa con código ${codempresa} no encontrada en la URL externa o datos incompletos.`, error);
      }
    }
  } catch (error) {
    console.error('Error en cron job:', error);
  }
};

// Configuración del cron job para ejecutarse cada 3 horas
const cron = require('node-cron');
cron.schedule('* * * * *', actualizarEmpresas);
