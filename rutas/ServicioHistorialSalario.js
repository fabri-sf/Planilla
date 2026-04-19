const express = require("express");
const Router = express.Router();

const ServicioHistorialSalario = require("../servicios/ServicioHistorialSalario.js");
const Usuarios = require('../servicios/ServicioUsuario.js');

/*Router.get("/Read", async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioHistorialSalario.Read(solicitud.body));
});*/

Router.get("/Read", async (solicitud, respuesta, next) => {
  if (await Usuarios.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioHistorialSalario.Read(solicitud.body)
      );
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});



/*Router.get("/ReadAll", async (req, res) => {
  res.json(await ServicioHistorialSalario.ReadAll());
});*/

Router.get("/ReadAll", async (solicitud, respuesta, next) => {
  if (await Usuarios.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioHistorialSalario.ReadAll()
      );
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});



/*Router.post("/Create", async (req, res) => {
  res.json(await ServicioHistorialSalario.Create(req.body));
});*/

Router.post("/Create", async (solicitud, respuesta, next) => {
  if (await Usuarios.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioHistorialSalario.Create({ ...solicitud.body, token: solicitud.headers.authorization })
      );
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});



/*Router.post("/Update", async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioHistorialSalario.Update(solicitud.body));
});*/

Router.post("/Update", async (solicitud, respuesta, next) => {
  if (await Usuarios.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioHistorialSalario.Update({ ...solicitud.body, token: solicitud.headers.authorization })
      );
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});


/*Router.post("/Delete", async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioHistorialSalario.Delete(solicitud.body));
});*/

Router.post("/Delete", async (solicitud, respuesta, next) => {
  if (await Usuarios.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioHistorialSalario.Delete({ ...solicitud.body, token: solicitud.headers.authorization })
      );
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});

module.exports = Router;