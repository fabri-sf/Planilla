const express = require('express');
const Router = express.Router();

const ServicioUsuario = require('../servicios/ServicioUsuario.js');

//Por filtro 
Router.get('/Read', async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioUsuario.Read(solicitud.body));
});

Router.get('/ReadAll', async (req, res) => {
  res.json(await ServicioUsuario.ReadAll());
});

//MODIFICAR LOS DELETE DE TODOS
Router.post('/Delete', async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioUsuario.Delete(solicitud.body));
});

module.exports = Router;
