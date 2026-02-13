const { ejecutarConsulta } = require('../db.js');

class ServicioAsistencia {

    constructor() { };

    async Read(Datos) {
        return await ejecutarConsulta("SELECT * FROM ASISTENCIA.`user` WHERE `user` =  ?"
            , [Datos.Usuario]);
    }

    async ReadAll() {
        return await ejecutarConsulta(
            'SELECT * FROM ASISTENCIA'
        );
    }

     async Delete(Datos) {
        return await ejecutarConsulta("DELETE FROM ASISTENCIA.`user` WHERE `user` = ?", [Datos.Usuario]);
    }

}

module.exports = new ServicioAsistencia();
