const { ejecutarConsulta } = require("../db.js");

// ── Helper ────────────────────────────────────────────────────────────────────

function calcularHoras(horaEntrada, horaSalida) {
  const toSegundos = (t) => {
    const [h, m, s] = String(t).split(":").map(Number);
    return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
  };

  const toHMS = (seg) => {
    const h = Math.floor(seg / 3600);
    const m = Math.floor((seg % 3600) / 60);
    const s = seg % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const JORNADA = 8 * 3600;
  const totalSeg = Math.max(0, toSegundos(horaSalida) - toSegundos(horaEntrada));
  const extrasSeg = Math.max(0, totalSeg - JORNADA);
  const normalesSeg = totalSeg - extrasSeg;

  return {
    horasTrabajadas: toHMS(normalesSeg),
    horasExtras: toHMS(extrasSeg),
  };
}

class ServicioAsistencia {
  constructor() {}

  async Read(Datos) {
    return await ejecutarConsulta(
      "SELECT * FROM ASISTENCIA WHERE empleadoId = ?",
      [Datos.empleadoId]
    );
  }

  async ReadAll() {
    return await ejecutarConsulta("SELECT * FROM ASISTENCIA");
  }

  async Create(Datos) {
    const { horasTrabajadas, horasExtras } = calcularHoras(
      Datos.horaEntrada,
      Datos.horaSalida
    );

    return await ejecutarConsulta(
      "INSERT INTO ASISTENCIA (empleadoId, fecha, horaEntrada, horaSalida, horasTrabajadas, horasExtras, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        Datos.empleadoId,
        Datos.fecha,
        Datos.horaEntrada,
        Datos.horaSalida,
        horasTrabajadas,
        horasExtras,
        Datos.observaciones,
      ]
    );
  }

  async Update(Datos) {
    const { horasTrabajadas, horasExtras } = calcularHoras(
      Datos.horaEntrada,
      Datos.horaSalida
    );

    return await ejecutarConsulta(
      "UPDATE ASISTENCIA SET empleadoId = ?, fecha = ?, horaEntrada = ?, horaSalida = ?, horasTrabajadas = ?, horasExtras = ?, observaciones = ? WHERE id = ?",
      [
        Datos.empleadoId,
        Datos.fecha,
        Datos.horaEntrada,
        Datos.horaSalida,
        horasTrabajadas,
        horasExtras,
        Datos.observaciones,
        Datos.id,
      ]
    );
  }
}

module.exports = new ServicioAsistencia();