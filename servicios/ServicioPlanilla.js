const { ejecutarConsulta } = require('../db.js');

class ServicioPlanilla {

    constructor() { };

    async Read(datos) {
        return await ejecutarConsulta(
            "SELECT * FROM Planilla WHERE id = ?",
            [datos.id]
        );
    }

    async ReadAll() {
        return await ejecutarConsulta(
            "SELECT * FROM Planilla"
        );
    }

    async Delete(datos) {
        return await ejecutarConsulta(
            "DELETE FROM Planilla WHERE id = ?",
            [datos.id]
        );
    }
    }


module.exports = new ServicioPlanilla();
