const express = require("express");
const Router = express.Router();

const ServicioBonificacionPago = require("../servicios/ServicioBonificacionPago.js");

//Por filtro
Router.get("/Read", async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioBonificacionPago.Read(solicitud.body));
});

Router.get("/ReadAll", async (req, res) => {
  res.json(await ServicioBonificacionPago.ReadAll());
});

Router.post("/Create", async (req, res) => {
  res.json(await ServicioBonificacionPago.Create(req.body));
});

Router.post("/Update", async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioBonificacionPago.Update(solicitud.body));
});

Router.post("/Delete", async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioBonificacionPago.Delete(solicitud.body));
});

module.exports = Router;
