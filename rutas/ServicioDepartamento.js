const express = require("express");
const Router = express.Router();

const ServicioDepartamento = require("../servicios/ServicioDepartamento.js");

//Por filtro
Router.get("/Read", async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioDepartamento.Read(solicitud.body));
});

Router.get("/ReadAll", async (req, res) => {
  res.json(await ServicioDepartamento.ReadAll());
});

Router.post("/Create", async (req, res) => {
  res.json(await ServicioDepartamento.Create(req.body));
});

Router.post("/Update", async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioDepartamento.Update(solicitud.body));
});

Router.post("/Delete", async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioDepartamento.Delete(solicitud.body));
});

module.exports = Router;
