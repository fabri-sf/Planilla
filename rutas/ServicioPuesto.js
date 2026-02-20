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

Router.post('/Create', async (req, res) => {
  res.json(await ServicioPuesto.Create(req.body));
});

// UPDATE
Router.post('/Update', async (req, res) => {
  res.json(await ServicioPuesto.Update(req.body));
});


//MODIFICAR LOS DELETE DE TODOS
Router.post('/Delete', async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioPuesto.Delete(solicitud.body));
});

module.exports = Router;
