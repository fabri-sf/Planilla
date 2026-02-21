const express = require('express');
const Router = express.Router();

const ServicioUsuario = require('../servicios/ServicioUsuario.js');

//Por filtro 
Router.get('/Read', async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioUsuario.Read(solicitud.body));
});

Router.get('/ReadAll', async (req, res) => {
  res.json(await ServicioUsuario.ReadAll());

});Router.post('/Create', async (req, res) => {
  res.json(await ServicioUsuario.Create(req.body));
});

Router.post('/Update', async (req, res) => {
  res.json(await ServicioUsuario.Update(req.body));
});

//MODIFICAR LOS DELETE DE TODOS
Router.post('/Delete', async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioUsuario.Delete(solicitud.body));
});


//Autenticacion 
Router.post("/Autenticacion", async (solicitud, respuesta) => {
  respuesta.json(await ServicioUsuario.Autenticacion(solicitud.body.correo, solicitud.body.contrasena));
});

Router.post("/validarToken", async (solicitud, respuesta) => {
  respuesta.json(await ServicioUsuario.ValidarToken(solicitud));
});

Router.post("/desautenticar", async (solicitud, respuesta) => {
  respuesta.json(await ServicioUsuario.DesAutenticacion(solicitud.body.CorreoElectronico));
});

module.exports = Router;
