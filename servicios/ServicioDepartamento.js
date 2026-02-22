const { ejecutarConsulta } = require("../db.js");

class ServicioDepartamento {
  constructor() {}

  async Read(Datos) {
    return await ejecutarConsulta(
      "SELECT * FROM HISTORIAL_SALARIO.`user` WHERE `user` =  ?",
      [Datos.Usuario],
    );
  }

  async ReadAll() {
    return await ejecutarConsulta("SELECT * FROM Departamento");
  }

  async Create(Datos) {
    return await ejecutarConsulta(
      `INSERT INTO DEPARTAMENTO 
        (codigo, nombre, descripcion, activo) 
        VALUES (?, ?, ?, ?)`,
      [Datos.codigo, Datos.nombre, Datos.descripcion, Datos.activo ?? true],
    );
  }

  async Update(Datos) {
    return await ejecutarConsulta(
      "UPDATE DEPARTAMENTO SET codigo = ?, nombre = ?, descripcion = ?, activo = ? WHERE id = ?",
      [Datos.codigo, Datos.nombre, Datos.descripcion, Datos.activo, Datos.id],
    );
  }

  async Delete(Datos) {
    return await ejecutarConsulta(
      "UPDATE DEPARTAMENTO SET estado = CASE WHEN estado = 'activo' THEN 'inactivo' ELSE 'activo' END WHERE id = ?",
      [Datos.id],
    );
  }
}

module.exports = new ServicioDepartamento();
