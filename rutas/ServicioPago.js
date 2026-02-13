const express = require('express');
const Router = express.Router();

const ServicioPago = require('../servicios/ServicioDeduccionPago.js');
    
//Por filtro 
Router.get('/Read', async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioPago.Read(solicitud.body));
});

Router.get('/ReadAll', async (req, res) => {
  res.json(await ServicioPago.ReadAll());
});


Router.post('/Delete', async (solicitud, respuesta, next) => { 
    return respuesta.json(await ServicioEmpleado.Delete(solicitud.body)); 
});

module.exports = Router;
