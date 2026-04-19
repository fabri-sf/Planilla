const express = require("express");
const Router  = express.Router();

const ServicioPlanilla = require("../servicios/ServicioPlanilla.js");
const Usuarios         = require("../servicios/ServicioUsuario.js");

//BORRAR
const ok  = async (res, fn) => { try { return res.json(await fn()); } catch (e) { console.error(e); return res.status(400).json({ error: e.message }); } };
const tok = (req) => req.headers.authorization;

Router.get("/ReadAll", async (req, res) => {
  if (!await Usuarios.ValidarToken(tok(req))) return res.status(401).json();
  ok(res, () => ServicioPlanilla.ReadAll());
});

Router.get("/Read", async (req, res) => {
  if (!await Usuarios.ValidarToken(tok(req))) return res.status(401).json();
  ok(res, () => ServicioPlanilla.Read(req.body));
});

Router.post("/Create", async (req, res) => {
  if (!await Usuarios.ValidarToken(tok(req))) return res.status(401).json();
  ok(res, () => ServicioPlanilla.Create({ ...req.body, token: tok(req) }));
});

Router.post("/Update", async (req, res) => {
  if (!await Usuarios.ValidarToken(tok(req))) return res.status(401).json();
  ok(res, () => ServicioPlanilla.Update({ ...req.body, token: tok(req) }));
});

Router.post("/Delete", async (req, res) => {
  if (!await Usuarios.ValidarToken(tok(req))) return res.status(401).json();
  ok(res, () => ServicioPlanilla.Delete(req.body));
});

// ── estados ───────────────────────────────────────────────────────
Router.post("/CambiarEstado", async (req, res) => {
  if (!await Usuarios.ValidarToken(tok(req))) return res.status(401).json();
  ok(res, () => ServicioPlanilla.CambiarEstado({ ...req.body, token: tok(req) }));
});

Router.post("/Atraso", async (req, res) => {
  if (!await Usuarios.ValidarToken(tok(req))) return res.status(401).json();
  ok(res, () => ServicioPlanilla.Atraso({ ...req.body, token: tok(req) }));
});

// ── Procesamiento de pagos ────────────────────────────────────────────────
Router.get("/Previsualizar", async (req, res) => {
  if (!await Usuarios.ValidarToken(tok(req))) return res.status(401).json();
  const planillaId   = Number(req.query.planillaId);
  const empleadosIds = req.query.empleadosIds
    ? req.query.empleadosIds.split(",").map(Number).filter(Boolean)
    : null;
  ok(res, () => ServicioPlanilla.Previsualizar(planillaId, empleadosIds));
});

Router.post("/GenerarPagos", async (req, res) => {
  if (!await Usuarios.ValidarToken(tok(req))) return res.status(401).json();
  ok(res, () => ServicioPlanilla.GenerarPagos({ ...req.body, token: tok(req) }));
});

// ── Reportes ───────────────────────────────────────────────────────────────
Router.get("/Reporte", async (req, res) => {
  if (!await Usuarios.ValidarToken(tok(req))) return res.status(401).json();
  ok(res, () => ServicioPlanilla.ReportePlanilla(Number(req.query.planillaId)));
});

Router.get("/ReporteDepartamento", async (req, res) => {
  if (!await Usuarios.ValidarToken(tok(req))) return res.status(401).json();
  ok(res, () => ServicioPlanilla.ReportePorDepartamento(Number(req.query.planillaId)));
});

module.exports = Router;
