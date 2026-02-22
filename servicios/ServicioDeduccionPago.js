const { ejecutarConsulta } = require('../db.js');

class ServicioDeduccionPago {

    constructor() { };

    async Read(Datos) {
        return await ejecutarConsulta("SELECT * FROM DEDUCCION_PAGO.`user` WHERE `user` =  ?"
            , [Datos.Usuario]);
    }

    async ReadAll() {
        return await ejecutarConsulta(
            'SELECT * FROM DEDUCCION_PAGO'
        );
    }

      async Create(Datos) {
        return await ejecutarConsulta(
            `INSERT INTO DEDUCCION_PAGO
            (pagoId, tipoDeduccionId, monto, observaciones)
            VALUES (?, ?, ?, ?)`,
            [
                Datos.pagoId,
                Datos.tipoDeduccionId,
                Datos.monto,
                Datos.observaciones
            ]
        );
    }

     async Edit(Datos) {
        return await ejecutarConsulta(
            `UPDATE DEDUCCION_PAGO
             SET pagoId = ?,
                 tipoDeduccionId = ?,
                 monto = ?,
                 observaciones = ?
             WHERE id = ?`,
            [
                Datos.pagoId,
                Datos.tipoDeduccionId,
                Datos.monto,
                Datos.observaciones,
                Datos.id
            ]
        );
    }


    async Delete(Datos) {
        return await ejecutarConsulta(
            "DELETE FROM DEDUCCION_PAGO WHERE id = ?",
            [Datos.id]
        );
    }
    }


module.exports = new ServicioDeduccionPago();
