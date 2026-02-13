const express = require('express');
const Router = express.Router();

const ServicioAsistencia = require('../servicios/ServicioAsistencia.js');

//Por filtro 
Router.get('/Read', async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioAsistencia.Read(solicitud.body));
});

Router.get('/ReadAll', async (req, res) => {
  res.json(await ServicioAsistencia.ReadAll());
});

//MODIFICAR LOS DELETE DE TODOS
Router.post('/Delete', async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioAsistencia.Delete(solicitud.body));
});

module.exports = Router;
