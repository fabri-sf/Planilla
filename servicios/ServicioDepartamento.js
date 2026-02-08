const { ejecutarConsulta } = require('../db.js');

class ServicioDepartamento {

    constructor() { };

    async Read(Datos) {
        return await ejecutarConsulta("SELECT * FROM `mysql`.`user` WHERE `User` =  ?"
            , [Datos.Usuario]);
    }

    async ReadAll() {
        return await ejecutarConsulta(
            'SELECT * FROM Departamento'
        );
    }

    async Delete() {
        return await ejecutarConsulta("SELECT * FROM `mysql`.`user` WHERE `User` = ?");
    }

}

module.exports = new ServicioDepartamento();
