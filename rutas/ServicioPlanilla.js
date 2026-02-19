const express = require('express');
const Router = express.Router();

const ServicioPlanilla = require('../servicios/ServicioPlanilla.js');

//Por filtro 
Router.get('/Read', async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioPlanilla.Read(solicitud.body));
});

Router.get('/ReadAll', async (req, res) => {
  res.json(await ServicioPlanilla.ReadAll());
});

//MODIFICAR LOS DELETE DE TODOS
Router.post('/Delete', async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioPlanilla.Delete(solicitud.body));
});

module.exports = Router;
