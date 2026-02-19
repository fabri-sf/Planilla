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

//MODIFICAR LOS DELETE DE TODOS
Router.post('/Delete', async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioTipoBonificacion.Delete(solicitud.body));
});

module.exports = Router;
