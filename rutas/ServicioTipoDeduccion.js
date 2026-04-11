const express = require('express');
const Router = express.Router();

const ServicioTipoDeduccion = require('../servicios/ServicioTipoDeduccion.js');
const Usuarios = require('../servicios/ServicioUsuario.js');

//Por filtro 
/*Router.get('/Read', async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioTipoDeduccion.Read(solicitud.body));
});*/

Router.get("/Read", async (solicitud, respuesta, next) => {
  if (await Usuarios.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(await ServicioTipoDeduccion.Read(solicitud.body));
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});



/*Router.get('/ReadAll', async (req, res) => {
  res.json(await ServicioTipoDeduccion.ReadAll());
});*/

Router.get("/ReadAll", async (solicitud, respuesta, next) => {
  if (await Usuarios.ValidarToken(solicitud.headers.authorization)) {
    try {
      return  respuesta.json(await ServicioTipoDeduccion.ReadAll());
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});



/*Router.post('/Create', async (req, res) => {
  res.json(await ServicioTipoDeduccion.Create(req.body));
});*/

Router.post("/Create", async (solicitud, respuesta, next) => {
  if (await Usuarios.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(await ServicioTipoDeduccion.Create(solicitud.body));
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});


/*Router.post('/Update', async (req, res) => {
  res.json(await ServicioTipoDeduccion.Update(req.body));
});*/


Router.post("/Update", async (solicitud, respuesta, next) => {
  if (await Usuarios.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(await ServicioTipoDeduccion.Update(solicitud.body));
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});


/*Router.post('/Delete', async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioTipoDeduccion.Delete(solicitud.body));
});*/

Router.post("/Delete", async (solicitud, respuesta, next) => {
  if (await Usuarios.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(await ServicioTipoDeduccion.Delete(solicitud.body));
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});


module.exports = Router;
