const { ejecutarConsulta } = require('../db.js');

class ServicioTipoContrato {

    constructor() { };

    async Read(Datos) {
        return await ejecutarConsulta("SELECT * FROM TIPO_CONTRATO.`user` WHERE `user` =  ?"
            , [Datos.Usuario]);
    }

    async ReadAll() {
        return await ejecutarConsulta(
            'SELECT * FROM TIPO_CONTRATO'
        );
    }

      async Delete(Datos) {
        return await ejecutarConsulta("DELETE FROM TIPO_CONTRATO.`user` WHERE `user` = ?", [Datos.Usuario]);
    }
    }


module.exports = new ServicioTipoContrato();
