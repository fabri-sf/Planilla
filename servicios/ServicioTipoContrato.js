const { ejecutarConsulta } = require("../db.js");

class ServicioTipoContrato {
  constructor() {}

  async Read(Datos) {
    return await ejecutarConsulta(
      "SELECT * FROM TIPO_CONTRATO.`user` WHERE `user` =  ?",
      [Datos.Usuario],
    );
  }

  async ReadAll() {
    return await ejecutarConsulta("SELECT * FROM TIPO_CONTRATO");
  }

  async Create(Datos) {
    return await ejecutarConsulta(
      "INSERT INTO TIPO_CONTRATO (nombre, horasSemanales, descripcion, activo) VALUES (?, ?, ?, ?)",
      [
        Datos.nombre,
        Datos.horasSemanales,
        Datos.descripcion,
        Datos.activo ?? true,
      ],
    );
  }

  async Update(Datos) {
    return await ejecutarConsulta(
      "UPDATE TIPO_CONTRATO SET nombre = ?, descripcion = ?, activo = ? WHERE id = ?",
      [Datos.nombre, Datos.descripcion, Datos.activo, Datos.id],
    );
  }

  async Delete(Datos) {
    return await ejecutarConsulta(
      "UPDATE TIPO_CONTRATO SET estado = CASE WHEN estado = 'activo' THEN 'inactivo' ELSE 'activo' END WHERE id = ?",
      [Datos.id],
    );
  }
}

module.exports = new ServicioTipoContrato();
