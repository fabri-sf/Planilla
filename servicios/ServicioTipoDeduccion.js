const { ejecutarConsulta } = require("../db.js");

class ServicioTipoDeduccion {
  constructor() {}

  async Read(datos) {
    return await ejecutarConsulta("SELECT * FROM TIPO_DEDUCCION WHERE id = ?", [
      datos.id,
    ]);
  }

  async ReadAll() {
    return await ejecutarConsulta("SELECT * FROM TIPO_DEDUCCION");
  }

  async Create(datos) {
    return await ejecutarConsulta(
      `INSERT INTO TIPO_DEDUCCION 
            (codigo, nombre, porcentaje, montoFijo, obligatorio, activo) 
            VALUES (?, ?, ?, ?, ?, ?)`,
      [
        datos.codigo,
        datos.nombre,
        datos.porcentaje,
        datos.montoFijo,
        datos.obligatorio,
        datos.activo,
      ],
    );
  }

  async Update(datos) {
    return await ejecutarConsulta(
      `UPDATE TIPO_DEDUCCION 
             SET codigo = ?, 
                 nombre = ?, 
                 porcentaje = ?, 
                 montoFijo = ?, 
                 obligatorio = ?, 
                 activo = ?
             WHERE id = ?`,
      [
        datos.codigo,
        datos.nombre,
        datos.porcentaje,
        datos.montoFijo,
        datos.obligatorio,
        datos.activo,
        datos.id,
      ],
    );
  }

  async Delete(datos) {
    return await ejecutarConsulta(
      "UPDATE TIPO_DEDUCCION SET estado = CASE WHEN estado = 'activo' THEN 'inactivo' ELSE 'activo' END WHERE id = ?",
      [datos.id],
    );
  }
}

module.exports = new ServicioTipoDeduccion();
