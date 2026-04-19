const { ejecutarConsulta } = require("../db.js");
const ServicioUsuario = require("./ServicioUsuario.js");

class ServicioPago {
  constructor() {}

  // ── PAGO ──────────────────────────────────────────────────────────────────

  async Read(Datos) {
    return await ejecutarConsulta("SELECT * FROM PAGO WHERE empleadoId = ?", [
      Datos.empleadoId,
    ]);
  }

  async ReadAll() {
    return await ejecutarConsulta("SELECT * FROM PAGO");
  }

  async ReadByPlanilla(planillaId) {
    return await ejecutarConsulta(
      `SELECT p.*, e.nombre, e.apellido, e.cedula
       FROM PAGO p
       JOIN EMPLEADO e ON p.empleadoId = e.id
       WHERE p.planillaId = ?
       ORDER BY e.apellido`,
      [planillaId],
    );
  }

  async Create(Datos) {
    const usuarioId = await ServicioUsuario.obtenerUsuarioId(Datos.token);

    try {
      await ejecutarConsulta(
        `INSERT INTO AUDITORIA (usuarioId, tabla, operacion, registroId, campoModificado, valorAnterior, valorNuevo, descripcion)
           VALUES (?, 'PAGO', 'INSERT', 0, 'todos', NULL, ?, ?)`,
        [
          usuarioId ?? 0,
          `empleadoId:${Datos.empleadoId}, planillaId:${Datos.planillaId}, salarioNeto:${Datos.salarioNeto}`,
          `Creación pago empleado ID: ${Datos.empleadoId}, planilla ID: ${Datos.planillaId}`,
        ],
      );
    } catch (e) {
      console.warn("AUDITORIA insert fallido (Create Pago):", e.message);
    }

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

    try {
      await ejecutarConsulta(
        `INSERT INTO AUDITORIA (usuarioId, tabla, operacion, registroId, campoModificado, valorAnterior, valorNuevo, descripcion)
           VALUES (?, 'PAGO', 'UPDATE', ?, 'observaciones', NULL, ?, ?)`,
        [
          usuarioId ?? 0,
          Datos.id,
          Datos.observaciones,
          `Actualización observaciones pago ID: ${Datos.id}`,
        ],
      );
    } catch (e) {
      console.warn("AUDITORIA insert fallido (Update Pago):", e.message);
    }

    // Solo se permite editar observaciones; los valores calculados son inmutables
    return await ejecutarConsulta(
      "UPDATE PAGO SET observaciones = ? WHERE id = ?",
      [Datos.observaciones, Datos.id],
    );
  }
}

module.exports = new ServicioPago();
