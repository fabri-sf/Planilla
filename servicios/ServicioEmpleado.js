const { ejecutarConsulta } = require("../db.js");

class ServicioEmpleado {
  constructor() {}

  async Read(Datos) {
    return await ejecutarConsulta(
      "SELECT * FROM EMPLEADO.`user` WHERE `user` =  ?",
      [Datos.Usuario],
    );
  }

  async ReadAll() {
    return await ejecutarConsulta("SELECT * FROM EMPLEADO");
  }

  async Create(Datos) {
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
    return await ejecutarConsulta(
      "UPDATE EMPLEADO SET cedula = ?, nombre = ?, apellido = ?, email = ?, telefono = ?, fechaNacimiento = ?, fechaIngreso = ?, salarioBase = ?, estado = ?, puestoId = ?, departamentoId = ?, tipoContratoId = ? WHERE id = ?",
      [
        Datos.cedula,
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
    return await ejecutarConsulta(
      "UPDATE EMPLEADO SET estado = CASE WHEN estado = 'activo' THEN 'inactivo' ELSE 'activo' END WHERE id = ?",
      [Datos.id],
    );
  }
}

module.exports = new ServicioEmpleado();
