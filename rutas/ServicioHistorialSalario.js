const express = require('express');
const Router = express.Router();

const ServicioHistorialSalario = require('../servicios/ServicioHistorialSalario.js');

//Por filtro 
Router.get('/Read', async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioHistorialSalario.Read(solicitud.body));
});

Router.get('/ReadAll', async (req, res) => {
  res.json(await ServicioHistorialSalario.ReadAll());
});

Router.post('/Create', async (req, res) => {
  res.json(await ServicioHistorialSalario.Create(req.body));
});

//MODIFICAR LOS DELETE DE TODOS
Router.post('/Delete', async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioHistorialSalario.Delete(solicitud.body));
});

module.exports = Router;
