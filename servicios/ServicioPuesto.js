const { ejecutarConsulta } = require("../db.js");

class ServicioPuesto {
  constructor() {}

  async Read(datos) {
    return await ejecutarConsulta("SELECT * FROM Puesto WHERE id = ?", [
      datos.id,
    ]);
  }

  async ReadAll() {
    return await ejecutarConsulta("SELECT * FROM Puesto");
  }

  async Create(datos) {
    return await ejecutarConsulta(
      `INSERT INTO PUESTO
            (codigo, nombre, descripcion, salarioMin, salarioMax, estado)
            VALUES (?, ?, ?, ?, ?, ?)`,
      [
        datos.codigo,
        datos.nombre,
        datos.descripcion,
        datos.salarioMin,
        datos.salarioMax,
        datos.estado ?? true,
      ],
    );
  }

  // UPDATE
  async Update(datos) {
    return await ejecutarConsulta(
      `UPDATE PUESTO
             SET codigo = ?,
                 nombre = ?,
                 descripcion = ?,
                 salarioMin = ?,
                 salarioMax = ?,
                 estado = ?
             WHERE id = ?`,
      [
        datos.codigo,
        datos.nombre,
        datos.descripcion,
        datos.salarioMin,
        datos.salarioMax,
        datos.estado,
        datos.id,
      ],
    );
  }

  // DELETE
  async Delete(datos) {
    return await ejecutarConsulta(
      "UPDATE PUESTO SET estado = CASE WHEN estado = 'activo' THEN 'inactivo' ELSE 'activo' END WHERE id = ?",
      [datos.id],
    );
}
}

module.exports = new ServicioPuesto();
