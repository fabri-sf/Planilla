const express = require("express");
const Router = express.Router();

const ServicioAuditoria = require("../servicios/ServicioAuditoria.js");
const Usuarios = require('../servicios/ServicioUsuario.js');

// ================= READ =================
/*Router.get("/Read", async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioAuditoria.Read(solicitud.body));
});*/

Router.get("/Read", async (solicitud, respuesta, next) => {
  if (await Usuarios.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioAuditoria.Read(solicitud.body)
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
  res.json(await ServicioAuditoria.ReadAll());
});*/

Router.get("/ReadAll", async (solicitud, respuesta, next) => {
  if (await Usuarios.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioAuditoria.ReadAll()
      );
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});

module.exports = Router;