// BOEX-backend/cronJobs.js
const axios = require('axios');
const mongoose = require('mongoose');
const Empresa = require('./models/empresas');
const Cotizacion = require('./models/cotizaciones');
const Indice = require('./models/indices');
const IndiceCotizacion = require('./models/indicesCotizaciones');

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
    dateDesdeUTC.setDate(dateDesdeUTC.getDate() - 30);  // TODO: CAMBIAR??
    const dateHastaUTC = new Date();

    const fechaDesde = obtenerFechaFormatoISO(dateDesdeUTC);
    const fechaHasta = obtenerFechaFormatoISO(dateHastaUTC);

    for (const empresa of empresas) {
      const url = `http://ec2-54-145-211-254.compute-1.amazonaws.com:3000/empresas/${empresa.codempresa}/cotizaciones?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`;

      // Mostrar la URL que está siendo consultada
      //console.log(`Consultando URL: ${url}`);
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
          //console.log(`Índice con código ${code} actualizado.`);
        } else {
          //console.log(`Índice con código ${code} ya está actualizado.`);
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
      //console.log('El índice ya existe:', indiceExistente);
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

const calcularIndicesHistoricos = async () => {
  try {
    // Obtener todas las empresas de la base de datos
    const empresas = await Empresa.find({});
    const hoy = new Date();
    const primerDiaDelAno = new Date(hoy.getFullYear(), 0, 1); // 1 de enero del año actual

    // Iterar por cada día desde el 1 de enero hasta hoy
    for (let dia = primerDiaDelAno; dia <= hoy; dia.setDate(dia.getDate() + 1)) {
      const fechaActual = dia.toISOString().slice(0, 10); // "YYYY-MM-DD"

      // Iterar por cada hora dentro del horario de la bolsa (UTC: 06:00 a 16:00)
      for (let hora = 6; hora < 17; hora++) {
        const horaUTC = hora.toString().padStart(2, '0') + ':00'; // "HH:00"

        // Convertir la hora UTC a hora rusa (UTC+3)
        const horaRusa = new Date(`${fechaActual}T${horaUTC}:00Z`);
        horaRusa.setHours(horaRusa.getHours() + 3);
        const horaRusaFormato = horaRusa.toISOString().slice(11, 16); // "HH:MM" en UTC+3

        // Verificar si ya existe un índice para esta fecha y hora rusa
        const indiceExistente = await IndiceCotizacion.findOne({
          codigoIndice: 'MOEX', // Mi código de índice
          fecha: fechaActual,
          hora: horaRusaFormato,
        });

        if (indiceExistente) {
          //console.log(`Índice ya existente para ${fechaActual} ${horaRusaFormato}. Saltando...`);
          continue;
        }

        // Inicializar el valor del índice para esa hora
        let sumaCapitalizacion = 0;

        for (const empresa of empresas) {
          // Obtener la cotización más reciente hasta esa hora UTC
          const ultimaCotizacion = await Cotizacion.findOne({
            codempresa: empresa.codempresa,
            dateUTC: { $lte: new Date(`${fechaActual}T${horaUTC}:00Z`) },
          })
            .sort({ dateUTC: -1 }) // Ordenar por fecha descendente
            .limit(1);

          if (ultimaCotizacion) {
            const capitalizacion = ultimaCotizacion.cotization * empresa.cantidadAcciones;
            sumaCapitalizacion += capitalizacion;
          } else {
            console.warn(`No se encontraron cotizaciones para la empresa ${empresa.codempresa}`);
          }
        }

        // Crear un nuevo índice bursátil para esa hora rusa
        const nuevoIndice = new IndiceCotizacion({
          fecha: fechaActual,
          hora: horaRusaFormato,
          codigoIndice: 'MOEX', // Mi código de índice
          valorIndice: parseFloat((sumaCapitalizacion / 10000000000).toFixed(2)), //divido por este numero exagerado porque, la suma me da por un numero exagerado.
        });

        await nuevoIndice.save();
        console.log('Índice bursátil calculado y guardado:', nuevoIndice);
      }
    }

    console.log('Cálculo de índices históricos completado.');

  } catch (error) {
    console.error('Error al calcular los índices históricos:', error);
  }
};

// Función para obtener cotizaciones y actualizar la base de datos
const actualizarCotizacionesIndices = async () => {
  try {
    // Obtener todos los índices excepto MOEX
    const indices = await Indice.find({ code: { $ne: 'MOEX' } });

    // Definir el rango de fechas (desde el 1 de enero hasta hoy)
    const fechaDesdeUTC = new Date(new Date().getFullYear(), 0, 1); // 1 de enero
    fechaDesdeUTC.setUTCHours(0, 0, 0, 0);
    const fechaHastaUTC = new Date(); // Hoy

    const fechaDesde = obtenerFechaFormatoISO(fechaDesdeUTC);
    const fechaHasta = obtenerFechaFormatoISO(fechaHastaUTC);
    //console.log(indices);

    for (const indice of indices) {
      const url = `http://ec2-54-145-211-254.compute-1.amazonaws.com:3000/indices/${indice.code}/cotizaciones?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`;

      // Mostrar la URL que está siendo consultada
      console.log(`Consultando URL: ${url}`);

      try {
        const response = await axios.get(url);
        const cotizaciones = response.data; // Se espera un arreglo de cotizaciones

        // Procesar cada cotización
        for (const cotizacionData of cotizaciones) {
          const { fecha, hora, valor } = cotizacionData;

          // Buscar si ya existe la cotización en la base de datos
          const cotizacionExistente = await IndiceCotizacion.findOne({
            codigoIndice: indice.code,
            fecha,
            hora,
          });

          if (cotizacionExistente) {
            // Actualizar la cotización existente
            cotizacionExistente.valor = parseFloat(valor);
            await cotizacionExistente.save();
            //console.log(`Cotización actualizada para ${indice.code} en ${fecha} ${hora}`);
          } else {
            // Crear una nueva cotización si no existe
            await IndiceCotizacion.create({
              codigoIndice: indice.code,
              fecha,
              hora,
              valorIndice: parseFloat(valor),
            });
            console.log(`Nueva cotización creada para ${indice.code} en ${fecha} ${hora}`);
          }
        }
      } catch (error) {
        console.error(`No se encontraron cotizaciones para el índice ${indice.code}. Error:`, error.message);
      }
    }
  } catch (error) {
    console.error('Error en la tarea de actualización de cotizaciones de índices:', error);
  }
};

async function publicarTodasLasCotizacionesMOEX() {
  try {
    // Obtener todas las cotizaciones de la base local con el código 'MOEX'
    const cotizaciones = await IndiceCotizacion.find({ codigoIndice: 'MOEX' }).exec();
    if (!cotizaciones || cotizaciones.length === 0) {
      console.log('No se encontraron cotizaciones con el código MOEX en la base local.');
      return;
    }

    console.log(`Se encontraron ${cotizaciones.length} cotizaciones para procesar.`);

    // Definir el rango de fechas (desde el 1 de enero hasta hoy)
    const fechaDesdeUTC = new Date(new Date().getFullYear(), 0, 1); // 1 de enero
    fechaDesdeUTC.setUTCHours(0, 0, 0, 0);
    const fechaHastaUTC = new Date(); // Hoy

    const fechaDesde = obtenerFechaFormatoISO(fechaDesdeUTC);
    const fechaHasta = obtenerFechaFormatoISO(fechaHastaUTC);

    // Verificar cotizaciones existentes en el servidor remoto
    const respuestaExistente = await axios.get(
      `http://ec2-54-145-211-254.compute-1.amazonaws.com:3000/indices/MOEX/cotizaciones?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`,
      {}
    );

    const cotizacionesExistentes = respuestaExistente.data || [];
    //console.log('Cotizaciones ya existentes en el servidor remoto:', cotizacionesExistentes);

    // Procesar y publicar cada cotización
    for (const cotizacion of cotizaciones) {
      const cotizacionRemota = {
        fecha: cotizacion.fecha,
        hora: cotizacion.hora,
        codigoIndice: cotizacion.codigoIndice,
        valorIndice: cotizacion.valorIndice,
      };

      // Verificar si la cotización ya existe en el servidor remoto
      const cotizacionExistente = cotizacionesExistentes.find(cot =>
        cot.code === cotizacionRemota.codigoIndice &&
        cot.fecha === cotizacionRemota.fecha &&
        cot.hora === cotizacionRemota.hora
      );

      if (cotizacionExistente) {
        console.log(`La cotización ya existe en el servidor remoto ${cotizacionRemota.fecha} ${cotizacionRemota.hora}`);
        continue; // Pasar a la siguiente cotización si ya existe
      }

      // Publicar la cotización en el servidor remoto
      try {
        const respuesta = await axios.post(
          'http://ec2-54-145-211-254.compute-1.amazonaws.com:3000/indices/cotizaciones',
          cotizacionRemota,
          {
            headers: {
              'Authorization': 'Bearer Luis_rios',
            },
          }
        );

        console.log(`Cotización publicada en el servidor remoto: ${cotizacionRemota.fecha},${cotizacionRemota.hora} `, respuesta.data);
      } catch (error) {
        console.error(`Error al publicar la cotización ${cotizacionRemota.fecha} ${cotizacionRemota.hora}:`, error.response ? error.response.data : error.message);
      }
    }
  } catch (error) {
    console.error('Error durante el proceso:', error.response ? error.response.data : error.message);
  }
}

const cron = require('node-cron');
cron.schedule('*/5 * * * *', actualizarEmpresas);//Actualizo empresas (No cambian nunca pero por las dudas)
cron.schedule('0 * * * *', actualizarCotizaciones);//Actualizo cotizaciones de empresas.
cron.schedule('0 * * * *', calcularIndicesHistoricos); // Ejecutar cada hora en el minuto 0 * * * *
cron.schedule('*/5 * * * *', actualizarIndices);//Actualizo empresas (Pueden cambiar, por las dudas)
cron.schedule('*/60 * * * *', crearIndiceMOEX);//Cada una hora verfico que mi indice se haya creado bien y exista en AWS
cron.schedule('*/5 * * * *', publicarTodasLasCotizacionesMOEX);//publico mis cotizaciones cada 5 minutos.
cron.schedule('*/10 * * * *', actualizarCotizacionesIndices);// me traigo las cotizaciones de los demas cada 10 minutos.
