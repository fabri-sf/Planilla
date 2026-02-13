const { ejecutarConsulta } = require('../db.js');

class ServicioPago {

    constructor() { };

    async Read(Datos) {
        return await ejecutarConsulta("SELECT * FROM PAGO.`user` WHERE `user` =  ?"
            , [Datos.Usuario]);
    }

    async ReadAll() {
        return await ejecutarConsulta(
            'SELECT * FROM PAGO'
        );
    }

      async Delete(Datos) {
        return await ejecutarConsulta("DELETE FROM PAGO.`user` WHERE `user` = ?", [Datos.Usuario]);
    }
    }


module.exports = new ServicioPago();
