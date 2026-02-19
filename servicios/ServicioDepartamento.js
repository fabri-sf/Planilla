const { ejecutarConsulta } = require('../db.js');

class ServicioDepartamento {

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

    async Create(Datos) {
    return await ejecutarConsulta(
        `INSERT INTO DEPARTAMENTO 
        (codigo, nombre, descripcion, activo) 
        VALUES (?, ?, ?, ?)`,
        [
            Datos.codigo,
            Datos.nombre,
            Datos.descripcion,
            Datos.activo ?? true
        ]
    );
}


      async Delete(Datos) {
        return await ejecutarConsulta("DELETE FROM Departamento.`user` WHERE `user` = ?", [Datos.Usuario]);
    }


    }


module.exports = new ServicioDepartamento();
