const { ejecutarConsulta } = require("../db.js");
const ServicioUsuario = require("./ServicioUsuario.js");

class ServicioPlanilla {
  constructor() {}

  async Read(datos) {
    return await ejecutarConsulta("SELECT * FROM Planilla WHERE id = ?", [
      datos.id,
    ]);
  }

  async ReadAll() {
    return await ejecutarConsulta("SELECT * FROM Planilla");
  }

  async Create(datos) {
    const usuarioId = await ServicioUsuario.obtenerUsuarioId(datos.token);

    await ejecutarConsulta(
      `INSERT INTO AUDITORIA (usuarioId, tabla, operacion, registroId, campoModificado, valorAnterior, valorNuevo, descripcion)
         VALUES (?, 'PLANILLA', 'INSERT', 0, 'todos', NULL, ?, ?)`,
      [
        usuarioId,
        `periodo:${datos.periodo}, estado:${datos.estado ?? "borrador"}`,
        `Creación planilla periodo: ${datos.periodo}`,
      ],
    );

    return await ejecutarConsulta(
      `INSERT INTO PLANILLA
            (periodo, fechaInicio, fechaFin, fechaPago, estado, descripcion, creadoPor, aprobadoPor)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        datos.periodo,
        datos.fechaInicio,
        datos.fechaFin,
        datos.fechaPago,
        datos.estado ?? "borrador",
        datos.descripcion,
        datos.creadoPor,
        datos.aprobadoPor,
      ],
    );
  }

  // UPDATE
  async Update(datos) {
    const usuarioId = await ServicioUsuario.obtenerUsuarioId(datos.token);

    await ejecutarConsulta(
      `INSERT INTO AUDITORIA (usuarioId, tabla, operacion, registroId, campoModificado, valorAnterior, valorNuevo, descripcion)
         VALUES (?, 'PLANILLA', 'UPDATE', ?, 'todos', NULL, ?, ?)`,
      [
        usuarioId,
        datos.id,
        `estado:${datos.estado}, fechaPago:${datos.fechaPago}`,
        `Modificación planilla ID: ${datos.id}`,
      ],
    );
    return await ejecutarConsulta(
      `UPDATE PLANILLA
             SET periodo = ?,
                 fechaInicio = ?,
                 fechaFin = ?,
                 fechaPago = ?,
                 estado = ?,
                 descripcion = ?,
                 creadoPor = ?,
                 aprobadoPor = ?
             WHERE id = ?`,
      [
        datos.periodo,
        datos.fechaInicio,
        datos.fechaFin,
        datos.fechaPago,
        datos.estado,
        datos.descripcion,
        datos.creadoPor,
        datos.aprobadoPor,
        datos.id,
      ],
    );
  }
}

module.exports = new ServicioPlanilla();
