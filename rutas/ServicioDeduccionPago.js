const express = require("express");
const Router = express.Router();

const ServicioDeduccionPago = require("../servicios/ServicioDeduccionPago.js");
const Usuarios = require('../servicios/ServicioUsuario.js');

// ================= READ =================
Router.get("/Read", async (solicitud, respuesta, next) => {
  if (await Usuarios.ValidarToken(solicitud.headers.authorization)) {
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
Router.get("/ReadAll", async (solicitud, respuesta, next) => {
  if (await Usuarios.ValidarToken(solicitud.headers.authorization)) {
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


// ================= READ POR PAGO =================

Router.get("/ReadPorPago", async (solicitud, respuesta, next) => {
  if (await Usuarios.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioDeduccionPago.ReadPorPago(Number(solicitud.query.pagoId))
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
Router.post("/Edit", async (solicitud, respuesta, next) => {
  if (await Usuarios.ValidarToken(solicitud.headers.authorization)) {
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


// ================= DELETE =================
Router.post("/Delete", async (solicitud, respuesta, next) => {
  if (await Usuarios.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioDeduccionPago.Delete(solicitud.body)
      );
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});

module.exports = Router;