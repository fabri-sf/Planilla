const express = require("express");
const Router = express.Router();

const ServicioPago = require("../servicios/ServicioPago.js");
const Usuarios = require('../servicios/ServicioUsuario.js');

// ================= READ =================
Router.get("/Read", async (solicitud, respuesta, next) => {
  if (await Usuarios.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(await ServicioPago.Read(solicitud.body));
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
      return respuesta.json(await ServicioPago.ReadAll());
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});

// ================= READ BY PLANILLA =================
Router.get("/ReadByPlanilla", async (solicitud, respuesta, next) => {
  if (await Usuarios.ValidarToken(solicitud.headers.authorization)) {
    try {
      const planillaId = solicitud.query.planillaId;
      return respuesta.json(await ServicioPago.ReadByPlanilla(planillaId));
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});

// ================= CREATE =================
// Crea el pago y aplica automáticamente las deducciones obligatorias
Router.post("/Create", async (solicitud, respuesta, next) => {
  if (await Usuarios.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioPago.Create({
          ...solicitud.body,
          token: solicitud.headers.authorization
        })
      );
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});

// ================= UPDATE =================
// Solo actualiza observaciones
Router.post("/Update", async (solicitud, respuesta, next) => {
  if (await Usuarios.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioPago.Update({
          ...solicitud.body,
          token: solicitud.headers.authorization
        })
      );
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});

// ================= RECALCULAR =================

Router.post("/Recalcular", async (solicitud, respuesta, next) => {
  if (await Usuarios.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioPago.Recalcular(solicitud.body.pagoId)
      );
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});

module.exports = Router;