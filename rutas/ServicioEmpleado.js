const express = require("express");
const Router = express.Router();

const ServicioEmpleado = require("../servicios/ServicioEmpleado.js");

//Por filtro
Router.get("/Read", async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioEmpleado.Read(solicitud.body));
});

Router.get("/ReadAll", async (req, res) => {
  res.json(await ServicioEmpleado.ReadAll());
});

Router.post("/Create", async (req, res) => {
  res.json(await ServicioEmpleado.Create(req.body));
});

Router.post("/Update", async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioEmpleado.Update(solicitud.body));
});

Router.post("/Delete", async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioEmpleado.Delete(solicitud.body));
});

module.exports = Router;
