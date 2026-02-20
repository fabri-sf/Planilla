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

        async Create(datos) {
        return await ejecutarConsulta(
            `INSERT INTO USUARIO
            (nombreUsuario, contrasena, correo, rol, empleadoId, activo)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                datos.nombreUsuario,
                datos.contrasena,
                datos.correo,
                datos.rol,
                datos.empleadoId,
                datos.activo
            ]
        );
    }

    async Update(datos) {
        return await ejecutarConsulta(
            `UPDATE USUARIO
             SET nombreUsuario = ?,
                 contrasena = ?,
                 correo = ?,
                 rol = ?,
                 empleadoId = ?,
                 activo = ?
             WHERE id = ?`,
            [
                datos.nombreUsuario,
                datos.contrasena,
                datos.correo,
                datos.rol,
                datos.empleadoId,
                datos.activo,
                datos.id
            ]
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
