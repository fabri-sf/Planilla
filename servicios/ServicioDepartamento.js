const { ejecutarConsulta } = require('../db.js');

class ServicioHistorialSalario {

    constructor() { };

    async Read(Datos) {
        return await ejecutarConsulta("SELECT * FROM HISTORIAL_SALARIO.`user` WHERE `user` =  ?"
            , [Datos.Usuario]);
    }

    async ReadAll() {
        return await ejecutarConsulta(
            'SELECT * FROM Departamento'
        );
    }

      async Delete(Datos) {
        return await ejecutarConsulta("DELETE FROM Departamento.`user` WHERE `user` = ?", [Datos.Usuario]);
    }
    }


module.exports = new ServicioDepartamento();
