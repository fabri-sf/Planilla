const express = require('express');
const cors = require('cors');

const asignarRutasAExpress = require('./rutas/rutas.js');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
asignarRutasAExpress(app);
app.use(cors());

const servidor = app.listen(80, () => {
  console.log('Backend corriendo en el puerto.');
});
