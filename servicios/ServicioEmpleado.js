const { ejecutarConsulta } = require('../db.js');

class ServicioEmpleado {

    constructor() { };

    async Read(Datos) {
        return await ejecutarConsulta("SELECT * FROM EMPLEADO.`user` WHERE `user` =  ?"
            , [Datos.Usuario]);
    }

    async ReadAll() {
        return await ejecutarConsulta(
            'SELECT * FROM EMPLEADO'
        );
    }

      async Delete(Datos) {
        return await ejecutarConsulta("DELETE FROM EMPLEADO.`user` WHERE `user` = ?", [Datos.Usuario]);
    }
    }


module.exports = new ServicioEmpleado();
