const { ejecutarConsulta } = require('../db.js');

class ServicioPuesto {

    constructor() { };

    async Read(datos) {
        return await ejecutarConsulta(
            "SELECT * FROM Puesto WHERE id = ?",
            [datos.id]
        );
    }

    async ReadAll() {
        return await ejecutarConsulta(
            "SELECT * FROM Puesto"
        );
    }

    async Delete(datos) {
        return await ejecutarConsulta(
            "DELETE FROM Puesto WHERE id = ?",
            [datos.id]
        );
    }
    }


module.exports = new ServicioPuesto();
