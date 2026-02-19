const { ejecutarConsulta } = require('../db.js');

class ServicioTipoBonificacion {

    constructor() { };

    async Read(datos) {
        return await ejecutarConsulta(
            "SELECT * FROM TIPO_BONIFICACION WHERE id = ?",
            [datos.id]
        );
    }

    async ReadAll() {
        return await ejecutarConsulta(
            "SELECT * FROM TIPO_BONIFICACION"
        );
    }

    async Delete(datos) {
        return await ejecutarConsulta(
            "DELETE FROM TIPO_BONIFICACION WHERE id = ?",
            [datos.id]
        );
    }
    }


module.exports = new ServicioTipoBonificacion();
