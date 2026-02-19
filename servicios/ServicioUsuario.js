const { ejecutarConsulta } = require('../db.js');

class ServicioUsuario {

    constructor() { };

    async Read(datos) {
        return await ejecutarConsulta(
            "SELECT * FROM USUARIO WHERE id = ?",
            [datos.id]
        );
    }

    async ReadAll() {
        return await ejecutarConsulta(
            "SELECT * FROM USUARIO"
        );
    }

    async Delete(datos) {
        return await ejecutarConsulta(
            "DELETE FROM USUARIO WHERE id = ?",
            [datos.id]
        );
    }
    }


module.exports = new ServicioUsuario();
