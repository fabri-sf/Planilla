const express = require('express');
const Router = express.Router();

const ServicioPuesto = require('../servicios/ServicioPuesto.js');

//Por filtro 
Router.get('/Read', async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioPuesto.Read(solicitud.body));
});

Router.get('/ReadAll', async (req, res) => {
  res.json(await ServicioPuesto.ReadAll());
});

//MODIFICAR LOS DELETE DE TODOS
Router.post('/Delete', async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioPuesto.Delete(solicitud.body));
});

module.exports = Router;
