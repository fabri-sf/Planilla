const { ejecutarConsulta } = require("../db.js");
const ServicioUsuario = require("./ServicioUsuario.js");

function round2(n) { return Math.round(n * 100) / 100; }

class ServicioPago {
  constructor() {}

  async Read(Datos) {
    return await ejecutarConsulta("SELECT * FROM PAGO WHERE empleadoId = ?", [
      Datos.empleadoId,
    ]);
  }

  async ReadAll() {
    return await ejecutarConsulta("SELECT * FROM PAGO");
  }

  async ReadByPlanilla(planillaId) {
    return await ejecutarConsulta(
      `SELECT p.*, e.nombre, e.apellido, e.cedula
       FROM PAGO p
       JOIN EMPLEADO e ON p.empleadoId = e.id
       WHERE p.planillaId = ?
       ORDER BY e.apellido`,
      [planillaId]
    );
  }

  async Create(Datos) {
    const usuarioId = await ServicioUsuario.obtenerUsuarioId(Datos.token);

    const salarioBase    = parseFloat(Datos.salarioBase) || 0;
    const diasTrabajados = parseInt(Datos.diasTrabajados) || 0;
    const diasEsperados  = parseInt(Datos.diasEsperados) || 30;
    const horasExtras    = parseFloat(Datos.horasExtras) || 0;

    const salarioProporcional = (salarioBase / diasEsperados) * diasTrabajados;
    const pagoHorasExtras     = (salarioBase / diasEsperados / 8) * 1.5 * horasExtras;
    const totalBruto          = round2(salarioProporcional + pagoHorasExtras);

    const tiposObligatorios = await ejecutarConsulta(
      "SELECT * FROM TIPO_DEDUCCION WHERE obligatorio = TRUE AND estado = 'activo'"
    );

    let totalDeducciones = 0;
    const deduccionesAInsertar = [];

    for (const tipo of tiposObligatorios) {
      let monto = 0;
      if (tipo.porcentaje !== null && tipo.porcentaje !== undefined) {
        monto = round2(totalBruto * (parseFloat(tipo.porcentaje) / 100));
      } else if (tipo.montoFijo !== null && tipo.montoFijo !== undefined) {
        // ✅ Monto fijo solo si el bruto lo puede cubrir
        const montoFijo = parseFloat(tipo.montoFijo);
        monto = totalBruto >= montoFijo ? round2(montoFijo) : 0;
      }
      totalDeducciones += monto;
      deduccionesAInsertar.push({ tipoId: tipo.id, nombre: tipo.nombre, monto });
    }

    totalDeducciones = round2(totalDeducciones);
    // ✅ El neto nunca puede ser negativo
    const salarioNeto = round2(Math.max(0, totalBruto - totalDeducciones));

    try {
      await ejecutarConsulta(
        `INSERT INTO AUDITORIA (usuarioId, tabla, operacion, registroId, campoModificado, valorAnterior, valorNuevo, descripcion)
         VALUES (?, 'PAGO', 'INSERT', 0, 'todos', NULL, ?, ?)`,
        [
          usuarioId ?? 0,
          `empleadoId:${Datos.empleadoId}, planillaId:${Datos.planillaId}, salarioNeto:${salarioNeto}`,
          `Creación pago empleado ID: ${Datos.empleadoId}, planilla ID: ${Datos.planillaId}`,
        ]
      );
    } catch (e) {
      console.warn("AUDITORIA insert fallido (Create Pago):", e.message);
    }

    const pagoRes = await ejecutarConsulta(
      `INSERT INTO PAGO 
         (empleadoId, planillaId, salarioBase, diasTrabajados, diasEsperados,
          horasExtras, totalBruto, totalDeducciones, totalBonificaciones, salarioNeto, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Datos.empleadoId, Datos.planillaId, salarioBase,
        diasTrabajados, diasEsperados, horasExtras,
        totalBruto, totalDeducciones, 0,
        salarioNeto, Datos.observaciones ?? ""
      ]
    );

    const pagoId = pagoRes.insertId;

    for (const ded of deduccionesAInsertar) {
      if (ded.monto > 0) {
        await ejecutarConsulta(
          `INSERT INTO DEDUCCION_PAGO (pagoId, tipoDeduccionId, monto, observaciones)
           VALUES (?, ?, ?, ?)`,
          [pagoId, ded.tipoId, ded.monto, `${ded.nombre} — aplicado automáticamente`]
        ).catch(e => console.warn(`DEDUCCION_PAGO ${ded.nombre}:`, e.message));
      }
    }

    return {
      pagoId,
      totalBruto,
      totalDeducciones,
      salarioNeto,
      deduccionesAplicadas: deduccionesAInsertar,
    };
  }

  async Update(Datos) {
    const usuarioId = await ServicioUsuario.obtenerUsuarioId(Datos.token);

    try {
      await ejecutarConsulta(
        `INSERT INTO AUDITORIA (usuarioId, tabla, operacion, registroId, campoModificado, valorAnterior, valorNuevo, descripcion)
         VALUES (?, 'PAGO', 'UPDATE', ?, 'observaciones', NULL, ?, ?)`,
        [
          usuarioId ?? 0,
          Datos.id,
          Datos.observaciones,
          `Actualización observaciones pago ID: ${Datos.id}`,
        ]
      );
    } catch (e) {
      console.warn("AUDITORIA insert fallido (Update Pago):", e.message);
    }

    return await ejecutarConsulta(
      "UPDATE PAGO SET observaciones = ? WHERE id = ?",
      [Datos.observaciones, Datos.id]
    );
  }

  // ✅ Recalcular corregido — neto nunca negativo
  async Recalcular(pagoId) {
    const deducciones = await ejecutarConsulta(
      "SELECT SUM(monto) AS total FROM DEDUCCION_PAGO WHERE pagoId = ?",
      [pagoId]
    );
    const bonificaciones = await ejecutarConsulta(
      "SELECT SUM(monto) AS total FROM BONIFICACION_PAGO WHERE pagoId = ?",
      [pagoId]
    );
    const pago = await ejecutarConsulta("SELECT * FROM PAGO WHERE id = ?", [pagoId]);
    if (!pago.length) throw new Error("Pago no encontrado");

    const totalDeducciones    = round2(parseFloat(deducciones[0].total) || 0);
    const totalBonificaciones = round2(parseFloat(bonificaciones[0].total) || 0);
    // ✅ Math.max(0, ...) para que el neto nunca sea negativo
    const salarioNeto = round2(
      Math.max(0, pago[0].totalBruto - totalDeducciones + totalBonificaciones)
    );

    await ejecutarConsulta(
      `UPDATE PAGO SET totalDeducciones = ?, totalBonificaciones = ?, salarioNeto = ? WHERE id = ?`,
      [totalDeducciones, totalBonificaciones, salarioNeto, pagoId]
    );

    return { pagoId, totalDeducciones, totalBonificaciones, salarioNeto };
  }
}

module.exports = new ServicioPago();