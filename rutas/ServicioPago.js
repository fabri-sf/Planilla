const express = require("express");
const Router = express.Router();

const ServicioPago = require("../servicios/ServicioPago.js");

//Por filtro
Router.get("/Read", async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioPago.Read(solicitud.body));
});

Router.get("/ReadAll", async (req, res) => {
  res.json(await ServicioPago.ReadAll());
});

Router.post("/Create", async (req, res) => {
  res.json(await ServicioPago.Create(req.body));
});

Router.post("/Update", async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioPago.Update(solicitud.body));
});

Router.post("/Delete", async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioPago.Delete(solicitud.body));
});

module.exports = Router;
