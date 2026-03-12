const express = require("express");
const Router = express.Router();

const ServicioPago = require("../servicios/ServicioPago.js");


/*Router.get("/Read", async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioPago.Read(solicitud.body));
});*/

Router.get("/Read", async (solicitud, respuesta, next) => {
  if (await ServicioPago.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioPago.Read(solicitud.body)
      );
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});



/*Router.get("/ReadAll", async (req, res) => {
  res.json(await ServicioPago.ReadAll());
});*/

Router.get("/ReadAll", async (solicitud, respuesta, next) => {
  if (await ServicioPago.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioPago.ReadAll()
      );
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});



/*Router.post("/Create", async (req, res) => {
  res.json(await ServicioPago.Create(req.body));
});*/

Router.post("/Create", async (solicitud, respuesta, next) => {
  if (await ServicioPago.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioPago.Create(solicitud.body)
      );
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});



/*Router.post("/Update", async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioPago.Update(solicitud.body));
});*/

Router.post("/Update", async (solicitud, respuesta, next) => {
  if (await ServicioPago.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioPago.Update(solicitud.body)
      );
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});

module.exports = Router;