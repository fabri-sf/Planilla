const { ejecutarConsulta } = require('../db.js');

class ServicioDeduccionPago {

    constructor() { };

    async Read(Datos) {
        return await ejecutarConsulta("SELECT * FROM DEDUCCION_PAGO.`user` WHERE `user` =  ?"
            , [Datos.Usuario]);
    }

    async ReadAll() {
        return await ejecutarConsulta(
            'SELECT * FROM DEDUCCION_PAGO'
        );
    }

      async Delete(Datos) {
        return await ejecutarConsulta("DELETE FROM DEDUCCION_PAGO.`user` WHERE `user` = ?", [Datos.Usuario]);
    }
    }


module.exports = new ServicioDeduccionPago();
