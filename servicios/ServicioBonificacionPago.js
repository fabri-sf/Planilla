const { ejecutarConsulta } = require('../db.js');

class ServicioBonificacionPago {

    constructor() { };

    async Read(datos) {
        return await ejecutarConsulta(
            "SELECT * FROM BONIFICACION_PAGO WHERE id = ?",
            [datos.id]
        );
    }

    async ReadAll() {
        return await ejecutarConsulta(
            "SELECT * FROM BONIFICACION_PAGO"
        );
    }

    async Delete(datos) {
        return await ejecutarConsulta(
            "DELETE FROM BONIFICACION_PAGO WHERE id = ?",
            [datos.id]
        );
    }
    }


module.exports = new ServicioBonificacionPago();
