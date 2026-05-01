const { ejecutarConsulta } = require("../db.js");
const ServicioUsuario = require("./ServicioUsuario.js");

class ServicioEmpleado {
  constructor() {}


  async Read(Datos) {
    return await ejecutarConsulta("SELECT * FROM EMPLEADO WHERE cedula = ?", [
      Datos.cedula,
    ]);
  }

  async ReadAll() {
    return await ejecutarConsulta("SELECT * FROM EMPLEADO");
  }

  async Create(Datos) {
    const usuarioId = await ServicioUsuario.obtenerUsuarioId(Datos.token);

    try {
      await ejecutarConsulta(
        `INSERT INTO AUDITORIA (usuarioId, tabla, operacion, registroId, campoModificado, valorAnterior, valorNuevo, descripcion)
           VALUES (?, 'EMPLEADO', 'INSERT', 0, 'todos', NULL, ?, ?)`,
        [
          usuarioId ?? null,
          `${Datos.nombre} ${Datos.apellido}`,
          `Creación empleado: ${Datos.nombre} ${Datos.apellido}`,
        ],
      );
    } catch (e) {
      console.warn("AUDITORIA insert fallido (Create Empleado):", e.message);
    }

    return await ejecutarConsulta(
      "INSERT INTO EMPLEADO (cedula, nombre, apellido, email, telefono, fechaNacimiento, fechaIngreso, salarioBase, estado, puestoId, departamentoId, tipoContratoId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        Datos.cedula,
        Datos.nombre,
        Datos.apellido,
        Datos.email,
        Datos.telefono,
        Datos.fechaNacimiento,
        Datos.fechaIngreso,
        Datos.salarioBase,
        Datos.estado ?? "activo",
        Datos.puestoId,
        Datos.departamentoId,
        Datos.tipoContratoId,
      ],
    );
  }

  async Update(Datos) {
    const usuarioId = await ServicioUsuario.obtenerUsuarioId(Datos.token);

    // Detectar cambio de salario para registrar en historial
    const actual = await ejecutarConsulta(
      "SELECT salarioBase FROM EMPLEADO WHERE id = ?",
      [Datos.id]
    );
    const salarioAnterior = actual.length ? parseFloat(actual[0].salarioBase) : 0;
    const salarioNuevo    = parseFloat(Datos.salarioBase) || 0;

    try {
      await ejecutarConsulta(
        `INSERT INTO AUDITORIA (usuarioId, tabla, operacion, registroId, campoModificado, valorAnterior, valorNuevo, descripcion)
           VALUES (?, 'EMPLEADO', 'UPDATE', ?, 'todos', NULL, ?, ?)`,
        [
          usuarioId ?? null,
          Datos.id,
          `${Datos.nombre} ${Datos.apellido}, salario:${Datos.salarioBase}, estado:${Datos.estado}`,
          `Modificación empleado ID: ${Datos.id}`,
        ],
      );
    } catch (e) {
      console.warn("AUDITORIA insert fallido (Update Empleado):", e.message);
    }

    if (salarioNuevo !== salarioAnterior) {
      await ejecutarConsulta(
        `INSERT INTO HISTORIAL_SALARIO (empleadoId, salarioAnterior, salarioNuevo, motivo, autorizadoPor)
         VALUES (?, ?, ?, ?, ?)`,
        [Datos.id, salarioAnterior, salarioNuevo, 'Ajuste desde módulo de empleados', usuarioId ?? null]
      ).catch(() => {});
    }

    return await ejecutarConsulta(
      "UPDATE EMPLEADO SET nombre = ?, apellido = ?, email = ?, telefono = ?, fechaNacimiento = ?, fechaIngreso = ?, salarioBase = ?, estado = ?, puestoId = ?, departamentoId = ?, tipoContratoId = ? WHERE id = ?",
      [
        Datos.nombre,
        Datos.apellido,
        Datos.email,
        Datos.telefono,
        Datos.fechaNacimiento,
        Datos.fechaIngreso,
        Datos.salarioBase,
        Datos.estado,
        Datos.puestoId,
        Datos.departamentoId,
        Datos.tipoContratoId,
        Datos.id,
      ],
    );
  }

  async Delete(Datos) {
    const usuarioId = await ServicioUsuario.obtenerUsuarioId(Datos.token);

    const actual = await ejecutarConsulta(
      "SELECT estado FROM EMPLEADO WHERE id = ?",
      [Datos.id],
    );
    const estadoActual = actual[0].estado;
    const estadoNuevo = estadoActual === "activo" ? "inactivo" : "activo";

    try {
      await ejecutarConsulta(
        `INSERT INTO AUDITORIA (usuarioId, tabla, operacion, registroId, campoModificado, valorAnterior, valorNuevo, descripcion)
           VALUES (?, 'EMPLEADO', 'UPDATE', ?, 'estado', ?, ?, ?)`,
        [
          usuarioId ?? null,
          Datos.id,
          estadoActual,
          estadoNuevo,
          `Cambio estado empleado ID: ${Datos.id}`,
        ],
      );
    } catch (e) {
      console.warn("AUDITORIA insert fallido (Delete Empleado):", e.message);
    }

    return await ejecutarConsulta(
      "UPDATE EMPLEADO SET estado = CASE WHEN estado = 'activo' THEN 'inactivo' ELSE 'activo' END WHERE id = ?",
      [Datos.id],
    );
  }
}

module.exports = new ServicioEmpleado();
