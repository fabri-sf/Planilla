const rutasDelServicio1 = require("./Servicio1.js");
const rutasDelServicioDep = require("./ServicioDepartamento.js");

const rutasDelServicioAsistencia = require("./ServicioAsistencia.js");
const rutasDelServicioAuditoria = require("./ServicioAuditoria.js");
const rutasDelServicioDeduccion = require("./Servicio1.js");
const rutasDelServicioEmpleado = require("./rutas/rutas/ServicioEmpleado.js");
const rutasDelServicioPago = require("./rutas/ServicioPago.js");
const rutasDelServicioTipoContrato = require("./rutas/ServicioTipoContrato.js");



function asignarRutasAExpress(app) {
  app.use("/Servicio1", rutasDelServicio1);
  app.use("/ServicioDepartamento", rutasDelServicioDep);

  app.use("/ServicioAsistencia", rutasDelServicioAsistencia);
  app.use("/ServicioAuditoria", rutasDelServicioAuditoria);
  app.use("/ServicioDeduccion", rutasDelServicioDeduccion);
  app.use("/ServicioEmpleado", rutasDelServicioEmpleado);
  app.use("/ServicioPago", rutasDelServicioPago);
  app.use("/ServicioTipoContrato", rutasDelServicioTipoContrato);
}

module.exports = asignarRutasAExpress;
