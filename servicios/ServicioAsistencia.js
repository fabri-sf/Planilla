const { ejecutarConsulta } = require("../db.js");

class ServicioAsistencia {
  constructor() {}

  async Read(Datos) {
    return await ejecutarConsulta(
      "SELECT * FROM ASISTENCIA.`user` WHERE `user` =  ?",
      [Datos.Usuario],
    );
  }

  async ReadAll() {
    return await ejecutarConsulta("SELECT * FROM ASISTENCIA");
  }

  async Create(Datos) {
    return await ejecutarConsulta(
      "INSERT INTO ASISTENCIA (empleadoId, fecha, horaEntrada, horaSalida, horasTrabajadas, horasExtras, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        Datos.empleadoId,
        Datos.fecha,
        Datos.horaEntrada,
        Datos.horaSalida,
        Datos.horasTrabajadas,
        Datos.horasExtras ?? 0,
        Datos.observaciones,
      ],
    );
  }

  async Update(Datos) {
    return await ejecutarConsulta(
      "UPDATE ASISTENCIA SET empleadoId = ?, fecha = ?, horaEntrada = ?, horaSalida = ?, horasTrabajadas = ?, horasExtras = ?, observaciones = ? WHERE id = ?",
      [
        Datos.empleadoId,
        Datos.fecha,
        Datos.horaEntrada,
        Datos.horaSalida,
        Datos.horasTrabajadas,
        Datos.horasExtras,
        Datos.observaciones,
        Datos.id,
      ],
    );
  }

  async Delete(Datos) {
    return await ejecutarConsulta("DELETE FROM ASISTENCIA WHERE id = ?", [
      Datos.id,
    ]);
  }
}

module.exports = new ServicioAsistencia();
