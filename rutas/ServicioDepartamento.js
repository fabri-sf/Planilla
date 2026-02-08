const express = require('express');
const Router = express.Router();

const ServicioDepartamento = require('../servicios/ServicioDepartamento.js');

//Por filtro 
Router.get('/Read', async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioDepartamento.Read(solicitud.body));
});

Router.get('/ReadAll', async (req, res) => {
  res.json(await ServicioDepartamento.ReadAll());
});


Router.post('/Delete', async (solicitud, respuesta, next) => {
  return respuesta.json(await Servicio1.listar2());
});

module.exports = Router;
