const express = require('express');
const Router = express.Router();

const ServicioUsuario = require('../servicios/ServicioUsuario.js');



Router.get("/Read", async (solicitud, respuesta, next) => {
  if (await ServicioUsuario.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(await Provincias.listar());
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});


Router.get('/ReadAll', async (solicitud, respuesta, next) => {
  if (await ServicioUsuario.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(await ServicioUsuario.ReadAll());
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});



Router.get('/Create', async (solicitud, respuesta, next) => {
  if (await ServicioUsuario.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(await ServicioUsuario.Create(req.body));
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});


Router.get('/Update', async (solicitud, respuesta, next) => {
  if (await ServicioUsuario.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(await ServicioUsuario.Update(req.body));
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});


Router.get('/Delete', async (solicitud, respuesta, next) => {
  if (await ServicioUsuario.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(await ServicioUsuario.Delete(solicitud.body));
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
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
