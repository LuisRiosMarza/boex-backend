// BOEX-backend/serverboex.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 5000;

// Importar cronjobs
require('./cronJobs');

// Middleware
app.use(cors());
app.use(express.json());

// Conectar a MongoDB
//mongodb://localhost:27017/boexbd
mongoose.connect('mongodb://host.docker.internal:27017/boexbd', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('No se pudo conectar a MongoDB', err));

// Importar rutas
const empresasRoutes = require('./routes/empresas');
const cotizacionesRoutes = require('./routes/cotizaciones');
const indicesRoutes = require('./routes/indices');
const indicesCotizacionesRoutes = require('./routes/indicesCotizaciones');

// Usar rutas
app.use('/api/empresas', empresasRoutes);
app.use('/api/cotizaciones', cotizacionesRoutes);
app.use('/api/indices', indicesRoutes);
app.use('/api/indicesCotizaciones', indicesCotizacionesRoutes);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
