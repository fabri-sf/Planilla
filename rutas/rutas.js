const rutasDelServicio1 = require("./Servicio1.js");
const rutasDelServicioDep = require("./ServicioDepartamento.js");

const rutasDelServicioAsistencia = require("./ServicioAsistencia.js");
const rutasDelServicioAuditoria = require("./ServicioAuditoria.js");
const rutasDelServicioDeduccion = require("./Servicio1.js");
const rutasDelServicioEmpleado = require("./ServicioEmpleado.js");
const rutasDelServicioPago = require("./ServicioPago.js");
const rutasDelServicioTipoContrato = require("./ServicioTipoContrato.js");
const rutasDelServicioPuesto = require("./ServicioPuesto.js");
const rutasDelServicioHistorialSalario = require("./ServicioHistorialSalario.js");
const rutasDelServicioPlanilla = require("./ServicioPlanilla.js");
const rutasDelServicioTipoDeduccion = require("./ServicioTipoDeduccion.js");
const rutasDelServicioTipoBonificacion = require("./ServicioTipoBonificacion.js");
const rutasDelServicioUsuario = require("./ServicioUsuario.js");
const rutasDelServiciBonificacionPago = require("./ServicioBonificacionPago.js");



function asignarRutasAExpress(app) {
  app.use("/Servicio1", rutasDelServicio1);
  app.use("/ServicioDepartamento", rutasDelServicioDep);

  app.use("/ServicioAsistencia", rutasDelServicioAsistencia);
  app.use("/ServicioAuditoria", rutasDelServicioAuditoria);
  app.use("/ServicioDeduccion", rutasDelServicioDeduccion);
  app.use("/ServicioEmpleado", rutasDelServicioEmpleado);
  app.use("/ServicioPago", rutasDelServicioPago);
  app.use("/ServicioTipoContrato", rutasDelServicioTipoContrato);
  app.use("/ServicioPuesto", rutasDelServicioPuesto);
  app.use("/ServicioHistorialSalario", rutasDelServicioHistorialSalario);
  app.use("/ServicioPlanilla", rutasDelServicioPlanilla);
  app.use("/ServicioTipoDeduccion", rutasDelServicioTipoDeduccion);
  app.use("/ServicioTipoBonificacion", rutasDelServicioTipoBonificacion);
  app.use("/ServicioUsuario", rutasDelServicioUsuario);
  app.use("/ServicioBonificacionPago", rutasDelServiciBonificacionPago);
}

module.exports = asignarRutasAExpress;
