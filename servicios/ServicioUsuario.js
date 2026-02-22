const { ejecutarConsulta } = require("../db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class ServicioUsuario {
  constructor() {}

  async Read(datos) {
    return await ejecutarConsulta("SELECT * FROM USUARIO WHERE id = ?", [
      datos.id,
    ]);
  }

  async ReadAll() {
    return await ejecutarConsulta("SELECT * FROM USUARIO");
  }

  async Create(datos) {
    const contrasenaHasheada = await bcrypt.hash(datos.contrasena, 10);
    const token = jwt.sign(
      { rol: datos.rol, correo: datos.correo },
      this.PalabraSecreta,
      { expiresIn: "10m" },
    );

    return await ejecutarConsulta(
      `INSERT INTO USUARIO
        (nombreUsuario, contrasena, correo, rol, empleadoId, activo, token)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        datos.nombreUsuario,
        contrasenaHasheada,
        datos.correo,
        datos.rol,
        datos.empleadoId,
        datos.activo,
        token,
      ],
    );
  }

  async Update(datos) {
    const contrasenaHasheada = await bcrypt.hash(datos.contrasena, 10);

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
        contrasenaHasheada,
        datos.correo,
        datos.rol,
        datos.empleadoId,
        datos.activo,
        datos.id,
      ],
    );
  }

  async Delete(datos) {
    return await ejecutarConsulta(
      "UPDATE USUARIO SET estado = CASE WHEN estado = 'activo' THEN 'inactivo' ELSE 'activo' END WHERE id = ?",
      [datos.id],
    );
  }

  PalabraSecreta = "MiPalabraSecreta";

  async Autenticacion(correo, ClaveSinEncriptar) {
    // Consultar en la base de datos si el usuario y la clave coninciden
    const usuarios = await ejecutarConsulta(
      "SELECT * FROM USUARIO WHERE correo = ? AND activo = TRUE",
      [correo],
    );
    if (!usuarios || usuarios.length === 0) return false;
    const Usuario = usuarios[0];
    let Resultado;
    try {
      Resultado = await bcrypt.compare(ClaveSinEncriptar, Usuario.contrasena);
    } catch (err) {
      console.log(err);
    }
    if (Resultado === true) {
      return this.GenerarToken(Usuario.rol, Usuario.correo);
    } else {
      return false;
    }
  }

  async GenerarToken(rol, correo) {
    let token = jwt.sign({ rol, correo }, this.PalabraSecreta, {
      expiresIn: "10m",
    });
    // Almacenar en la base de datos para el usuario
    await ejecutarConsulta("UPDATE USUARIO SET token = ? WHERE correo = ?", [
      token,
      correo,
    ]);

    return token;
  }

  async ValidarToken(solicitud) {
    let token;
    try {
      token = solicitud.headers.authorization.split(" ")[1];
    } catch (err) {
      return err;
    }
    let Resultado;
    // Validación del token
    try {
      Resultado = await jwt.verify(token, this.PalabraSecreta);
    } catch (err) {
      return err;
    }
    // Se debe validar que el usuario tenga asignado ese token
    const usuarios = await ejecutarConsulta(
      "SELECT * FROM USUARIO WHERE correo = ?",
      [Resultado.correo],
    );
    if (!usuarios || usuarios.length === 0) return false;
    const Usuario = usuarios[0];

    if (Usuario.Token === token) {
      return Resultado;
    } else {
      return false;
    }
  }

  async DesAutenticacion(correo) {
    // Borrar del usuario el token que tenga
    await ejecutarConsulta("UPDATE USUARIO SET token = NULL WHERE correo = ?", [
      correo,
    ]);
  }
}

module.exports = new ServicioUsuario();
