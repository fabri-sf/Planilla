const { ejecutarConsulta } = require("../db.js");

class ServicioAuditoria {
  constructor() {}

 async Read(Datos) {
  return await ejecutarConsulta(
    "SELECT * FROM AUDITORIA WHERE tabla = ?",
    [Datos.tabla]
  );
}

  async ReadAll() {
    return await ejecutarConsulta("SELECT * FROM AUDITORIA");
  }
}

module.exports = new ServicioAuditoria();
