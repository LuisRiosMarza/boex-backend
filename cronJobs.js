// BOEX-backend/cronJobs.js
const axios = require('axios');
const mongoose = require('mongoose');
const Empresa = require('./models/empresas');
const Cotizacion = require('./models/cotizaciones');
const Indice = require('./models/indices');

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
          //console.log(`Empresa ${data.empresaNombre} actualizada.`);
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

// Obtener las fechas para el rango de búsqueda
const obtenerFechaFormatoISO = (fecha) => {
  return fecha.toISOString().slice(0, 16);  // "YYYY-MM-DDTHH:mm"
};

// Función para obtener cotizaciones y actualizar la base de datos
const actualizarCotizaciones = async () => {
  try {
    // Obtener todas las empresas desde la base de datos
    const empresas = await Empresa.find({});
    
    // Obtener las fechas para el rango de búsqueda
    const dateDesdeUTC = new Date();
    dateDesdeUTC.setDate(dateDesdeUTC.getDate() - 365);  // TODO: CAMBIAR??
    const dateHastaUTC = new Date();

    const fechaDesde = obtenerFechaFormatoISO(dateDesdeUTC);
    const fechaHasta = obtenerFechaFormatoISO(dateHastaUTC);

    for (const empresa of empresas) {
      const url = `http://ec2-54-145-211-254.compute-1.amazonaws.com:3000/empresas/${empresa.codempresa}/cotizaciones?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`;

       // Mostrar la URL que está siendo consultada
       console.log(`Consultando URL: ${url}`);
      try {
        const response = await axios.get(url);
        const cotizaciones = response.data; // Se espera un arreglo de cotizaciones
        
        // Procesar cada cotización
        for (const cotizacionData of cotizaciones) {
          const { id, fecha, hora, dateUTC, cotization } = cotizacionData;

          // Buscar si ya existe la cotización en la base de datos
          const cotizacionExistente = await Cotizacion.findOne({ id });

          if (cotizacionExistente) {
            // Actualizar la cotización existente
            cotizacionExistente.fecha = fecha;
            cotizacionExistente.hora = hora;
            cotizacionExistente.dateUTC = new Date(dateUTC);
            cotizacionExistente.cotization = parseFloat(cotization);
            cotizacionExistente.codempresa = empresa.codempresa;
            await cotizacionExistente.save();
            //console.log(`Cotización ${id} actualizada para la empresa ${empresa.codempresa}`);
          } else {
            // Crear una nueva cotización si no existe
            await Cotizacion.create({
              id,
              fecha: fecha,
              hora,
              dateUTC: new Date(dateUTC),
              cotization: parseFloat(cotization),
              codempresa: empresa.codempresa,
            });
            console.log(`Cotización ${id} creada para la empresa ${empresa.codempresa}`);
          }
        }
      } catch (error) {
        console.error(`No se encontraron cotizaciones para la empresa ${empresa.codempresa}. Error:`, error.message);
      }
    }
  } catch (error) {
    console.error('Error en la tarea de actualización de cotizaciones:', error);
  }
};

const actualizarIndices = async () => {
  try {
    // Obtener todos los índices desde la URL externa
    const { data } = await axios.get('http://ec2-54-145-211-254.compute-1.amazonaws.com:3000/indices');

    // Recorrer todos los índices obtenidos
    for (const indiceData of data) {
      const { code, name } = indiceData;

      // Verificar si el índice ya existe en la base de datos
      const indiceExistente = await Indice.findOne({ code });

      if (indiceExistente) {
        // Si el índice existe, verificar si la información es diferente
        if (indiceExistente.name !== name) {
          // Si el nombre es diferente, actualizarlo
          indiceExistente.name = name;
          await indiceExistente.save();
          console.log(`Índice con código ${code} actualizado.`);
        } else {
          console.log(`Índice con código ${code} ya está actualizado.`);
        }
      } else {
        // Si el índice no existe, crear uno nuevo
        const nuevoIndice = new Indice({
          code,
          name,
        });
        await nuevoIndice.save();
        console.log(`Índice con código ${code} creado.`);
      }
    }
  } catch (error) {
    console.error('Error al actualizar los índices:', error);
  }
};

async function crearIndiceMOEX() {
  const indice = {
    code: 'MOEX',
    name: 'Moscow Exchange',
  };

  try {
    // Verificar si el índice ya existe antes de intentar crearlo
    const respuestaExistente = await axios.get('http://ec2-54-145-211-254.compute-1.amazonaws.com:3000/indices', {
      headers: {
        'Authorization': 'Bearer Luis_rios',
      },
    });

    const indiceExistente = respuestaExistente.data.find(indice => indice.code === 'MOEX');
    
    if (indiceExistente) {
      console.log('El índice ya existe:', indiceExistente);
      return; // Salir si el índice ya está creado
    }

    // Si no existe, proceder con la creación del índice
    const respuesta = await axios.post('http://ec2-54-145-211-254.compute-1.amazonaws.com:3000/indices', indice, {
      headers: {
        'Authorization': 'Bearer Luis_rios',
      },
    });

    console.log('Índice creado:', respuesta.data);
  } catch (error) {
    // Manejar errores generales, como problemas de conexión o conflicto
    if (error.response && error.response.status === 409) {
      console.log('Conflicto al crear el índice: El índice ya existe');
    } else {
      console.error('Error al actualizar los índices:', error);
    }
  }
}


// Configuración del cron job para ejecutarse cada 3 horas
const cron = require('node-cron');
cron.schedule('* * * * *', actualizarEmpresas);
cron.schedule('*/10 * * * *', actualizarCotizaciones);
cron.schedule('* * * * *', actualizarIndices);
cron.schedule('* * * * *', crearIndiceMOEX);
