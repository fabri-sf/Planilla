const express = require("express");
const Router = express.Router();

const ServicioPuesto = require("../servicios/ServicioPuesto.js");


/*Router.get("/Read", async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioPuesto.Read(solicitud.body));
});*/

Router.get("/Read", async (solicitud, respuesta, next) => {
  if (await ServicioPuesto.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(await ServicioPuesto.Read(solicitud.body));
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});



/*Router.get("/ReadAll", async (req, res) => {
  res.json(await ServicioPuesto.ReadAll());
});*/

Router.get("/ReadAll", async (solicitud, respuesta, next) => {
  if (await ServicioPuesto.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json( await ServicioPuesto.ReadAll()  );
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});



/*Router.post("/Create", async (req, res) => {
  res.json(await ServicioPuesto.Create(req.body));
});*/

Router.post("/Create", async (solicitud, respuesta, next) => {
  if (await ServicioPuesto.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(  await ServicioPuesto.Create(solicitud.body)  );
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});



/*Router.post("/Update", async (req, res) => {
  res.json(await ServicioPuesto.Update(req.body));
});*/

Router.post("/Update", async (solicitud, respuesta, next) => {
  if (await ServicioPuesto.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json( await ServicioPuesto.Update(solicitud.body));
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});



/*Router.post("/Delete", async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioPuesto.Delete(solicitud.body));
});*/

Router.post("/Delete", async (solicitud, respuesta, next) => {
  if (await ServicioPuesto.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json( await ServicioPuesto.Delete(solicitud.body) );
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});

module.exports = Router;