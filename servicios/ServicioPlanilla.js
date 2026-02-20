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

     async Create(datos) {
        return await ejecutarConsulta(
            `INSERT INTO PLANILLA
            (periodo, fechaInicio, fechaFin, fechaPago, estado, descripcion, creadoPor, aprobadoPor)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                datos.periodo,
                datos.fechaInicio,
                datos.fechaFin,
                datos.fechaPago,
                datos.estado ?? 'borrador',
                datos.descripcion,
                datos.creadoPor,
                datos.aprobadoPor
            ]
        );
    }

   // UPDATE
    async Update(datos) {
        return await ejecutarConsulta(
            `UPDATE PLANILLA
             SET periodo = ?,
                 fechaInicio = ?,
                 fechaFin = ?,
                 fechaPago = ?,
                 estado = ?,
                 descripcion = ?,
                 creadoPor = ?,
                 aprobadoPor = ?
             WHERE id = ?`,
            [
                datos.periodo,
                datos.fechaInicio,
                datos.fechaFin,
                datos.fechaPago,
                datos.estado,
                datos.descripcion,
                datos.creadoPor,
                datos.aprobadoPor,
                datos.id
            ]
        );
    }

    // DELETE
    async Delete(datos) {
        return await ejecutarConsulta(
            "DELETE FROM PLANILLA WHERE id = ?",
            [datos.id]
        );
    }
}
    


module.exports = new ServicioPlanilla();
