const { ejecutarConsulta } = require('../db.js');

class ServicioTipoDeduccion {

    constructor() { };

    async Read(datos) {
        return await ejecutarConsulta(
            "SELECT * FROM TIPO_DEDUCCION WHERE id = ?",
            [datos.id]
        );
    }

    async ReadAll() {
        return await ejecutarConsulta(
            "SELECT * FROM TIPO_DEDUCCION"
        );
    }

    async Delete(datos) {
        return await ejecutarConsulta(
            "DELETE FROM TIPO_DEDUCCION WHERE id = ?",
            [datos.id]
        );
    }
    }


module.exports = new ServicioTipoDeduccion();
