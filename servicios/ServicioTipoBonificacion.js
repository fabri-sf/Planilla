const { ejecutarConsulta } = require("../db.js");

class ServicioTipoBonificacion {
  constructor() {}

  async Read(datos) {
    return await ejecutarConsulta(
      "SELECT * FROM TIPO_BONIFICACION WHERE id = ?",
      [datos.id],
    );
  }

  async ReadAll() {
    return await ejecutarConsulta("SELECT * FROM TIPO_BONIFICACION");
  }

  async Create(datos) {
    return await ejecutarConsulta(
      `INSERT INTO TIPO_BONIFICACION 
            (codigo, nombre, descripcion, estado)
            VALUES (?, ?, ?, ?)`,
      [datos.codigo, datos.nombre, datos.descripcion, datos.estado],
    );
  }

  async Update(datos) {
    return await ejecutarConsulta(
      `UPDATE TIPO_BONIFICACION
             SET codigo = ?,
                 nombre = ?,
                 descripcion = ?,
                 estado = ?
             WHERE id = ?`,
      [datos.codigo, datos.nombre, datos.descripcion, datos.estado, datos.id],
    );
  }

  async Delete(datos) {
    return await ejecutarConsulta(
      "UPDATE TIPO_BONIFICACION SET estado = CASE WHEN estado = 'activo' THEN 'inactivo' ELSE 'activo' END WHERE id = ?",
      [datos.id],
    );
  }
}

module.exports = new ServicioTipoBonificacion();
