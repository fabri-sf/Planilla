const { ejecutarConsulta } = require("../db.js");

class ServicioBonificacionPago {
  constructor() {}

  async Read(Datos) {
    return await ejecutarConsulta(
      "SELECT * FROM BONIFICACION_PAGO WHERE pagoId = ?",
      [Datos.pagoId],
    );
  }

  async ReadAll() {
    return await ejecutarConsulta("SELECT * FROM BONIFICACION_PAGO");
  }

    async ReadPorPago(pagoId) {
    return await ejecutarConsulta(
      `SELECT bp.*, tb.nombre, tb.codigo
       FROM BONIFICACION_PAGO bp
       JOIN TIPO_BONIFICACION tb ON bp.tipoBonificacionId = tb.id
       WHERE bp.pagoId = ?`,
      [pagoId]
    );
  }

  async Create(datos) {
    return await ejecutarConsulta(
      "INSERT INTO BONIFICACION_PAGO (pagoId, tipoBonificacionId, monto, observaciones) VALUES (?, ?, ?, ?)",
      [
        datos.pagoId,
        datos.tipoBonificacionId,
        datos.monto,
        datos.observaciones,
      ],
    );
  }

  async Update(datos) {
    return await ejecutarConsulta(
      "UPDATE BONIFICACION_PAGO SET pagoId = ?, tipoBonificacionId = ?, monto = ?, observaciones = ? WHERE id = ?",
      [
        datos.pagoId,
        datos.tipoBonificacionId,
        datos.monto,
        datos.observaciones,
        datos.id,
      ],
    );
  }

  async Delete(datos) {
    return await ejecutarConsulta(
      "DELETE FROM BONIFICACION_PAGO WHERE id = ?",
      [datos.id],
    );
  }
}

module.exports = new ServicioBonificacionPago();
