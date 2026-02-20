const express = require('express');
const Router = express.Router();

const ServicioAuditoria = require('../servicios/ServicioAuditoria.js');

//Por filtro 
Router.get('/Read', async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioAuditoria.Read(solicitud.body));
});

Router.get('/ReadAll', async (req, res) => {
  res.json(await ServicioAuditoria.ReadAll());
});



module.exports = Router;
