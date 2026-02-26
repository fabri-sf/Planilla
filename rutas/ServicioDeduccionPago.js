const express = require('express');
const Router = express.Router();

const ServicioDeduccionPago = require('../servicios/ServicioDeduccionPago.js');
    
//Por filtro 
Router.get('/Read', async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioDeduccionPago.Read(solicitud.body));
});

Router.get('/ReadAll', async (req, res) => {
  res.json(await ServicioDeduccionPago.ReadAll());
});


Router.post('/Create', async (req, res) => {
  res.json(await ServicioDeduccionPago.Create(req.body));
});

// EDIT
Router.post('/Edit', async (req, res) => {
  res.json(await ServicioDeduccionPago.Edit(req.body));
});

Router.post('/Delete', async (solicitud, respuesta, next) => { 
    return respuesta.json(await ServicioDeduccionPago.Delete(solicitud.body)); 
});

module.exports = Router;
