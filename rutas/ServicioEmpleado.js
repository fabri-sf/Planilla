const express = require("express");
const Router = express.Router();

const ServicioEmpleado = require("../servicios/ServicioEmpleado.js");

// ================= READ =================
/*Router.get("/Read", async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioEmpleado.Read(solicitud.body));
});*/

Router.get("/Read", async (solicitud, respuesta, next) => {
  if (await ServicioEmpleado.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioEmpleado.Read(solicitud.body)
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
  res.json(await ServicioEmpleado.ReadAll());
});*/

Router.get("/ReadAll", async (solicitud, respuesta, next) => {
  if (await ServicioEmpleado.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioEmpleado.ReadAll()
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
  res.json(await ServicioEmpleado.Create(req.body));
});*/

Router.post("/Create", async (solicitud, respuesta, next) => {
  if (await ServicioEmpleado.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioEmpleado.Create(solicitud.body)
      );
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});


// ================= UPDATE =================
/*Router.post("/Update", async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioEmpleado.Update(solicitud.body));
});*/

Router.post("/Update", async (solicitud, respuesta, next) => {
  if (await ServicioEmpleado.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioEmpleado.Update(solicitud.body)
      );
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});


// ================= DELETE =================
/*Router.post("/Delete", async (solicitud, respuesta, next) => {
  return respuesta.json(await ServicioEmpleado.Delete(solicitud.body));
});*/

Router.post("/Delete", async (solicitud, respuesta, next) => {
  if (await ServicioEmpleado.ValidarToken(solicitud.headers.authorization)) {
    try {
      return respuesta.json(
        await ServicioEmpleado.Delete(solicitud.body)
      );
    } catch (error) {
      console.error(error);
      return respuesta.status(500).json(error);
    }
  }
  return respuesta.status(401).json();
});

module.exports = Router;