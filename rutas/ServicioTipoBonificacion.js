const express = require('express');
const Router = express.Router();

const ServicioTipoBonificacion = require('../servicios/ServicioTipoBonificacion.js');

//Por filtro 
Router.get('/Read', async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioTipoBonificacion.Read(solicitud.body));
});

Router.get('/ReadAll', async (req, res) => {
  res.json(await ServicioTipoBonificacion.ReadAll());
});

Router.post('/Create', async (req, res) => {
  res.json(await ServicioTipoBonificacion.Create(req.body));
});

Router.post('/Update', async (req, res) => {
  res.json(await ServicioTipoBonificacion.Update(req.body));
});

//MODIFICAR LOS DELETE DE TODOS
Router.post('/Delete', async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioTipoBonificacion.Delete(solicitud.body));
});

module.exports = Router;
