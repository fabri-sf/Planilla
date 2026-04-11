const express = require('express');

const asignarRutasAExpress = require('./rutas/rutas.js');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
asignarRutasAExpress(app);

const servidor = app.listen(80, () => {
  console.log('Backend corriendo en el puerto.');
});
