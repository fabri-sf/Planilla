const express = require("express");
const Router = express.Router();

const ServicioDeduccionPago = require("../servicios/ServicioDeduccionPago.js");

// ================= READ =================
/*Router.get("/Read", async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioDeduccionPago.Read(solicitud.body));
});*/

Router.get("/Read", async (solicitud, respuesta, next) => {
  if (await ServicioDeduccionPago.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioDeduccionPago.Read(solicitud.body)
      );
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});


// ================= READ ALL =================
/*Router.get("/ReadAll", async (req, res) => {
  res.json(await ServicioDeduccionPago.ReadAll());
});*/

Router.get("/ReadAll", async (solicitud, respuesta, next) => {
  if (await ServicioDeduccionPago.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioDeduccionPago.ReadAll()
      );
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});


// ================= CREATE =================
/*Router.post("/Create", async (req, res) => {
  res.json(await ServicioDeduccionPago.Create(req.body));
});*/

Router.post("/Create", async (solicitud, respuesta, next) => {
  if (await ServicioDeduccionPago.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioDeduccionPago.Create(solicitud.body)
      );
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});


// ================= EDIT =================
/*Router.post("/Edit", async (req, res) => {
  res.json(await ServicioDeduccionPago.Edit(req.body));
});*/

Router.post("/Edit", async (solicitud, respuesta, next) => {
  if (await ServicioDeduccionPago.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioDeduccionPago.Edit(solicitud.body)
      );
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});



module.exports = Router;