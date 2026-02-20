const express = require("express");
const Router = express.Router();

const ServicioTipoContrato = require("../servicios/ServicioTipoContrato.js");

//Por filtro
Router.get("/Read", async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioTipoContrato.Read(solicitud.body));
});

Router.get("/ReadAll", async (req, res) => {
  res.json(await ServicioTipoContrato.ReadAll());
});

Router.post("/Create", async (req, res) => {
  res.json(await ServicioTipoContrato.Create(req.body));
});

Router.post("/Update", async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioTipoContrato.Update(solicitud.body));
});

Router.post("/Delete", async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioTipoContrato.Delete(solicitud.body));
});

module.exports = Router;
