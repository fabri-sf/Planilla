const { ejecutarConsulta } = require("../db.js");

class ServicioBonificacionPago {
  constructor() {}

  async Read(datos) {
    return await ejecutarConsulta(
      "SELECT * FROM BONIFICACION_PAGO WHERE id = ?",
      [datos.id],
    );
  }

  async ReadAll() {
    return await ejecutarConsulta("SELECT * FROM BONIFICACION_PAGO");
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
