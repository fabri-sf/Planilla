const { ejecutarConsulta } = require('../db.js');

class ServicioHistorialSalario {

    constructor() { };

    async Read(Datos) {
        return await ejecutarConsulta("SELECT * FROM Departamento.`user` WHERE `user` =  ?"
            , [Datos.Usuario]);
    }

    async ReadAll() {
        return await ejecutarConsulta(
            'SELECT * FROM HISTORIAL_SALARIO'
        );
    }

       async Create(Datos) {
        return await ejecutarConsulta(
            `INSERT INTO HISTORIAL_SALARIO 
            (empleadoId, salarioAnterior, salarioNuevo, motivo, autorizadoPor)
            VALUES (?, ?, ?, ?, ?)`,
            [
                Datos.empleadoId,
                Datos.salarioAnterior,
                Datos.salarioNuevo,
                Datos.motivo,
                Datos.autorizadoPor
            ]
        );
    }

   async Delete(Datos) {
        return await ejecutarConsulta(
            "DELETE FROM HISTORIAL_SALARIO WHERE id = ?",
            [Datos.id]
        );
    }
    }


module.exports = new ServicioHistorialSalario();
