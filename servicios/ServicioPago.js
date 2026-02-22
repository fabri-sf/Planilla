const { ejecutarConsulta } = require("../db.js");
const ServicioUsuario = require("./ServicioUsuario.js");

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
    const usuarioId = await ServicioUsuario.obtenerUsuarioId(Datos.token);

    await ejecutarConsulta(
      `INSERT INTO AUDITORIA (usuarioId, tabla, operacion, registroId, campoModificado, valorAnterior, valorNuevo, descripcion)
         VALUES (?, 'PAGO', 'INSERT', 0, 'todos', NULL, ?, ?)`,
      [
        usuarioId,
        `empleadoId:${Datos.empleadoId}, planillaId:${Datos.planillaId}, salarioNeto:${Datos.salarioNeto}`,
        `Creación pago empleado ID: ${Datos.empleadoId}, planilla ID: ${Datos.planillaId}`,
      ],
    );

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
    const usuarioId = await ServicioUsuario.obtenerUsuarioId(Datos.token);

    await ejecutarConsulta(
      `INSERT INTO AUDITORIA (usuarioId, tabla, operacion, registroId, campoModificado, valorAnterior, valorNuevo, descripcion)
         VALUES (?, 'PAGO', 'UPDATE', ?, 'todos', NULL, ?, ?)`,
      [
        usuarioId,
        Datos.id,
        `salarioBase:${Datos.salarioBase}, diasTrabajados:${Datos.diasTrabajados}, horasExtras:${Datos.horasExtras}, salarioNeto:${Datos.salarioNeto}`,
        `Modificación pago ID: ${Datos.id}`,
      ],
    );
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
}

module.exports = new ServicioPago();
