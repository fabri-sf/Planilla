const { ejecutarConsulta } = require("../db.js");
const ServicioUsuario = require("./ServicioUsuario.js");

class ServicioHistorialSalario {
  constructor() {}

  async Read(Datos) {
    return await ejecutarConsulta(
      "SELECT * FROM Departamento.`user` WHERE `user` =  ?",
      [Datos.Usuario],
    );
  }

  async ReadAll() {
    return await ejecutarConsulta("SELECT * FROM HISTORIAL_SALARIO");
  }

  async Create(Datos) {
    const usuarioId = await ServicioUsuario.obtenerUsuarioId(Datos.token);

    await ejecutarConsulta(
      `INSERT INTO AUDITORIA (usuarioId, tabla, operacion, registroId, campoModificado, valorAnterior, valorNuevo, descripcion)
         VALUES (?, 'HISTORIAL_SALARIO', 'INSERT', 0, 'salario', ?, ?, ?)`,
      [
        usuarioId,
        String(Datos.salarioAnterior),
        String(Datos.salarioNuevo),
        `Cambio salario empleado ID: ${Datos.empleadoId} - Motivo: ${Datos.motivo}`,
      ],
    );
    return await ejecutarConsulta(
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
  }
  async Update(Datos) {
    const usuarioId = await ServicioUsuario.obtenerUsuarioId(Datos.token);

    await ejecutarConsulta(
      `INSERT INTO AUDITORIA (usuarioId, tabla, operacion, registroId, campoModificado, valorAnterior, valorNuevo, descripcion)
         VALUES (?, 'HISTORIAL_SALARIO', 'UPDATE', ?, 'salario', ?, ?, ?)`,
      [
        usuarioId,
        Datos.id,
        String(Datos.salarioAnterior),
        String(Datos.salarioNuevo),
        `Modificación historial salario ID: ${Datos.id} - Motivo: ${Datos.motivo}`,
      ],
    );

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
