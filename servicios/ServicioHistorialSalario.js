const { ejecutarConsulta } = require("../db.js");
const ServicioUsuario = require("./ServicioUsuario.js");

class ServicioHistorialSalario {
  constructor() {}

  // ── HISTORIAL_SALARIO ─────────────────────────────────────────────────────

  async Read(Datos) {
    return await ejecutarConsulta(
      "SELECT * FROM HISTORIAL_SALARIO WHERE empleadoId = ?",
      [Datos.empleadoId],
    );
  }

  async ReadAll() {
    return await ejecutarConsulta("SELECT * FROM HISTORIAL_SALARIO");
  }

  async Create(Datos) {
    const usuarioId = await ServicioUsuario.obtenerUsuarioId(Datos.token);

    try {
      await ejecutarConsulta(
        `INSERT INTO AUDITORIA (usuarioId, tabla, operacion, registroId, campoModificado, valorAnterior, valorNuevo, descripcion)
           VALUES (?, 'HISTORIAL_SALARIO', 'INSERT', 0, 'salario', ?, ?, ?)`,
        [
          usuarioId ?? 0,
          String(Datos.salarioAnterior),
          String(Datos.salarioNuevo),
          `Cambio salario empleado ID: ${Datos.empleadoId} - Motivo: ${Datos.motivo}`,
        ],
      );
    } catch (e) {
      console.warn("AUDITORIA insert fallido (Create HistorialSalario):", e.message);
    }

    // Insertar en historial
    const resultado = await ejecutarConsulta(
      `INSERT INTO HISTORIAL_SALARIO
            (empleadoId, salarioAnterior, salarioNuevo, motivo, autorizadoPor)
            VALUES (?, ?, ?, ?, ?)`,
      [
        Datos.empleadoId,
        Datos.salarioAnterior,
        Datos.salarioNuevo,
        Datos.motivo,
        Datos.autorizadoPor,
      ],
    );

    // Actualizar salarioBase en EMPLEADO con el salario nuevo
    await ejecutarConsulta(
      "UPDATE EMPLEADO SET salarioBase = ? WHERE id = ?",
      [Datos.salarioNuevo, Datos.empleadoId],
    );

    return resultado;
  }

  async Update(Datos) {
    const usuarioId = await ServicioUsuario.obtenerUsuarioId(Datos.token);

    try {
      await ejecutarConsulta(
        `INSERT INTO AUDITORIA (usuarioId, tabla, operacion, registroId, campoModificado, valorAnterior, valorNuevo, descripcion)
           VALUES (?, 'HISTORIAL_SALARIO', 'UPDATE', ?, 'salario', ?, ?, ?)`,
        [
          usuarioId ?? 0,
          Datos.id,
          String(Datos.salarioAnterior),
          String(Datos.salarioNuevo),
          `Modificación historial salario ID: ${Datos.id} - Motivo: ${Datos.motivo}`,
        ],
      );
    } catch (e) {
      console.warn("AUDITORIA insert fallido (Update HistorialSalario):", e.message);
    }

    return await ejecutarConsulta(
      `UPDATE HISTORIAL_SALARIO SET empleadoId = ?, salarioAnterior = ?, salarioNuevo = ?, motivo = ?, autorizadoPor = ? WHERE id = ?`,
      [
        Datos.empleadoId,
        Datos.salarioAnterior,
        Datos.salarioNuevo,
        Datos.motivo,
        Datos.autorizadoPor,
        Datos.id,
      ],
    );
  }
}

module.exports = new ServicioHistorialSalario();
