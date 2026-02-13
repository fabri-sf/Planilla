const { ejecutarConsulta } = require('../db.js');

class ServicioAuditoria {

    constructor() { };

    async Read(Datos) {
        return await ejecutarConsulta("SELECT * FROM AUDITORIA.`user` WHERE `user` =  ?"
            , [Datos.Usuario]);
    }

    async ReadAll() {
        return await ejecutarConsulta(
            'SELECT * FROM AUDITORIA'
        );
    }

    async Delete(Datos) {
        return await ejecutarConsulta("DELETE FROM AUDITORIA.`user` WHERE `user` = ?", [Datos.Usuario]);
    }

}

module.exports = new ServicioAuditoria();
