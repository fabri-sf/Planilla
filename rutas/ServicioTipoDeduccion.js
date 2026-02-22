const express = require('express');
const Router = express.Router();

const ServicioTipoDeduccion = require('../servicios/ServicioTipoDeduccion.js');

//Por filtro 
Router.get('/Read', async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioTipoDeduccion.Read(solicitud.body));
});

Router.get('/ReadAll', async (req, res) => {
  res.json(await ServicioTipoDeduccion.ReadAll());
});

Router.post('/Create', async (req, res) => {
  res.json(await ServicioTipoDeduccion.Create(req.body));
});
Router.post('/Update', async (req, res) => {
  res.json(await ServicioTipoDeduccion.Update(req.body));
});

//MODIFICAR LOS DELETE DE TODOS
Router.post('/Delete', async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioTipoDeduccion.Delete(solicitud.body));
});

module.exports = Router;
