const { ejecutarConsulta } = require("../db.js");

class ServicioPago {
  constructor() {}

  async Read(Datos) {
    return await ejecutarConsulta(
      "SELECT * FROM PAGO.`user` WHERE `user` =  ?",
      [Datos.Usuario],
    );
  }

  async ReadAll() {
    return await ejecutarConsulta("SELECT * FROM PAGO");
  }

  async Create(Datos) {
    return await ejecutarConsulta(
      "INSERT INTO PAGO (empleadoId, planillaId, salarioBase, diasTrabajados, diasEsperados, horasExtras, totalBruto, totalDeducciones, totalBonificaciones, salarioNeto, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        Datos.empleadoId,
        Datos.planillaId,
        Datos.salarioBase,
        Datos.diasTrabajados,
        Datos.diasEsperados,
        Datos.horasExtras ?? 0,
        Datos.totalBruto,
        Datos.totalDeducciones ?? 0,
        Datos.totalBonificaciones ?? 0,
        Datos.salarioNeto,
        Datos.observaciones,
      ],
    );
  }

  async Update(Datos) {
    return await ejecutarConsulta(
      "UPDATE PAGO SET empleadoId = ?, planillaId = ?, salarioBase = ?, diasTrabajados = ?, diasEsperados = ?, horasExtras = ?, totalBruto = ?, totalDeducciones = ?, totalBonificaciones = ?, salarioNeto = ?, observaciones = ? WHERE id = ?",
      [
        Datos.empleadoId,
        Datos.planillaId,
        Datos.salarioBase,
        Datos.diasTrabajados,
        Datos.diasEsperados,
        Datos.horasExtras,
        Datos.totalBruto,
        Datos.totalDeducciones,
        Datos.totalBonificaciones,
        Datos.salarioNeto,
        Datos.observaciones,
        Datos.id,
      ],
    );
  }

  async Delete(Datos) {
    return await ejecutarConsulta("DELETE FROM PAGO WHERE id = ?", [Datos.id]);
  }
}

module.exports = new ServicioPago();
