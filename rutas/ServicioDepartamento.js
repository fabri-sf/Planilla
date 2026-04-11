const express = require("express");
const Router = express.Router();

const ServicioDepartamento = require("../servicios/ServicioDepartamento.js");
const Usuarios = require('../servicios/ServicioUsuario.js');

// ================= READ =================
Router.get("/Read", async (solicitud, respuesta, next) => {
  if (await Usuarios.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioDepartamento.Read(solicitud.body)
      );
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});


// ================= READ ALL =================
Router.get("/ReadAll", async (solicitud, respuesta, next) => {
  if (await Usuarios.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioDepartamento.ReadAll()
      );
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});


// ================= CREATE =================
Router.post("/Create", async (solicitud, respuesta, next) => {
  if (await Usuarios.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioDepartamento.Create(solicitud.body)
      );
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});


// ================= UPDATE =================
Router.post("/Update", async (solicitud, respuesta, next) => {
  if (await Usuarios.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioDepartamento.Update(solicitud.body)
      );
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});


// ================= DELETE =================
Router.post("/Delete", async (solicitud, respuesta, next) => {
  if (await Usuarios.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioDepartamento.Delete(solicitud.body)
      );
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});

module.exports = Router;
