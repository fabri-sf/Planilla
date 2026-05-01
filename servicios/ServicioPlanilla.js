const { ejecutarConsulta } = require("../db.js");
const ServicioUsuario = require("./ServicioUsuario.js");

function round2(n) {
  return Math.round(n * 100) / 100;
}

function toHoras(valor) {
  if (!valor && valor !== 0) return 0;
  const str = String(valor).trim();
  if (/^\d+(\.\d+)?$/.test(str)) return parseFloat(str);
  const partes = str.split(":").map(Number);
  const h = partes[0] || 0;
  const m = partes[1] || 0;
  const s = partes[2] || 0;
  return round2(h + m / 60 + s / 3600);
}

async function obtenerAsistencias(empleadoId, fechaInicio, fechaFin) {
  let asistencias = await ejecutarConsulta(
    "SELECT * FROM ASISTENCIA WHERE empleadoId = ? AND fecha BETWEEN ? AND ?",
    [empleadoId, fechaInicio, fechaFin]
  );
  if (!asistencias.length) {
    asistencias = await ejecutarConsulta(
      "SELECT * FROM ASISTENCIA WHERE empleadoId = ?",
      [empleadoId]
    );
  }
  return asistencias;
}

function calcularMontosPago(emp, asistencias, tiposDeduccion) {
  const salarioBase = parseFloat(emp.salarioBase) || 0;
  const HORAS_MES = 240;

  const horasTrabajadas = asistencias.reduce((s, a) => s + toHoras(a.horasTrabajadas), 0);
  const horasExtras     = asistencias.reduce((s, a) => s + toHoras(a.horasExtras), 0);

  const valorHora           = round2(salarioBase / HORAS_MES);
  const salarioProporcional = round2(valorHora * horasTrabajadas);
  const pagoHorasExtras     = round2(valorHora * 1.5 * horasExtras);
  const totalBruto          = round2(salarioProporcional + pagoHorasExtras);
  const diasTrabajados      = asistencias.length;

  let ccssObrero = 0;
  let renta = 0;
  const deduccionesCalculadas = [];

  for (const tipo of tiposDeduccion) {
    let monto = 0;

    const tienePorcentaje =
      tipo.porcentaje !== null &&
      tipo.porcentaje !== undefined &&
      tipo.porcentaje !== "" &&
      !isNaN(parseFloat(tipo.porcentaje));

    const tieneMontoFijo =
      tipo.montoFijo !== null &&
      tipo.montoFijo !== undefined &&
      tipo.montoFijo !== "" &&
      !isNaN(parseFloat(tipo.montoFijo));

    if (tienePorcentaje) {
      monto = round2(totalBruto * (parseFloat(tipo.porcentaje) / 100));
      if (tipo.obligatorio) monto = round2(monto / 2);
    } else if (tieneMontoFijo) {
      const montoFijo = parseFloat(tipo.montoFijo);
      const montoProporcional = round2((montoFijo / HORAS_MES) * horasTrabajadas);
      monto = totalBruto >= montoProporcional ? montoProporcional : 0;
      if (tipo.obligatorio) monto = round2(monto / 2);
    }

    if (monto <= 0) continue;

    const cod = (tipo.codigo || "").toUpperCase();
    const nom = (tipo.nombre || "").toUpperCase();

    if (cod === "DED-001" || nom.includes("CCSS") || nom.includes("SEGURO SOCIAL") || nom.includes("CAJA") || nom.includes("OBRERO"))
      ccssObrero += monto;

    if (cod === "DED-002" || nom.includes("RENTA") || nom.includes("ISR") || nom.includes("IMPUESTO"))
      renta += monto;

    deduccionesCalculadas.push({ tipoDeduccionId: tipo.id, nombre: tipo.nombre, codigo: tipo.codigo, monto });
  }

  const totalDeducciones = round2(deduccionesCalculadas.reduce((s, d) => s + d.monto, 0));

  return {
    diasTrabajados,
    horasTrabajadas:   round2(horasTrabajadas),
    horasExtras:       round2(horasExtras),
    valorHora,
    salarioProporcional,
    pagoHorasExtras,
    totalBruto,
    deduccionesCalculadas,
    totalDeducciones,
    salarioNeto:   round2(Math.max(0, totalBruto - totalDeducciones)),
    ccssObrero:    round2(ccssObrero),
    renta:         round2(renta),
    cargasCCSS:    round2(totalBruto * 0.2667),
    bancoPopular:  round2(totalBruto * 0.005),
  };
}



class ServicioPlanilla {
  constructor() {}

  async Read(datos) {
    return await ejecutarConsulta(
      "SELECT * FROM PLANILLA WHERE periodo LIKE ?",
      [`%${datos.periodo}%`]
    );
  }

  async ReadAll() {
    return await ejecutarConsulta("SELECT * FROM PLANILLA ORDER BY id DESC");
  }

  async Create(datos) {
    const usuarioId = await ServicioUsuario.obtenerUsuarioId(datos.token);
    try {
      await ejecutarConsulta(
        `INSERT INTO AUDITORIA (usuarioId, tabla, operacion, registroId, campoModificado, valorAnterior, valorNuevo, descripcion)
         VALUES (?, 'PLANILLA', 'INSERT', 0, 'todos', NULL, ?, ?)`,
        [usuarioId ?? null, `periodo:${datos.periodo}`, `Creación planilla: ${datos.periodo}`]
      );
    } catch (e) { console.warn("AUDITORIA Create Planilla:", e.message); }

    return await ejecutarConsulta(
      `INSERT INTO PLANILLA (periodo, fechaInicio, fechaFin, fechaPago, estado, descripcion, creadoPor)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        datos.periodo,
        datos.fechaInicio,
        datos.fechaFin,
        datos.fechaPago,
        datos.estado ?? "borrador",
        datos.descripcion ?? "",
        datos.creadoPor > 0 ? datos.creadoPor : null,
      ]
    );
  }

  async Update(datos) {
    const usuarioId = await ServicioUsuario.obtenerUsuarioId(datos.token);
    try {
      await ejecutarConsulta(
        `INSERT INTO AUDITORIA (usuarioId, tabla, operacion, registroId, campoModificado, valorAnterior, valorNuevo, descripcion)
         VALUES (?, 'PLANILLA', 'UPDATE', ?, 'todos', NULL, ?, ?)`,
        [usuarioId ?? null, datos.id, `estado:${datos.estado}`, `Modificación planilla ID:${datos.id}`]
      );
    } catch (e) { console.warn("AUDITORIA Update Planilla:", e.message); }

    return await ejecutarConsulta(
      `UPDATE PLANILLA SET periodo=?, fechaInicio=?, fechaFin=?, fechaPago=?,
       estado=?, descripcion=?, creadoPor=?, aprobadoPor=? WHERE id=?`,
      [
        datos.periodo, datos.fechaInicio, datos.fechaFin, datos.fechaPago,
        datos.estado, datos.descripcion, datos.creadoPor, datos.aprobadoPor, datos.id,
      ]
    );
  }

  async Delete(datos) {
    const rows = await ejecutarConsulta("SELECT estado FROM PLANILLA WHERE id = ?", [datos.id]);
    if (!rows.length) throw new Error("Planilla no encontrada");
    if (rows[0].estado !== "borrador") throw new Error("Solo se pueden eliminar planillas en estado borrador");

    await ejecutarConsulta(
      "DELETE FROM DEDUCCION_PAGO WHERE pagoId IN (SELECT id FROM PAGO WHERE planillaId = ?)",
      [datos.id]
    );
    await ejecutarConsulta("DELETE FROM PAGO WHERE planillaId = ?", [datos.id]);
    return await ejecutarConsulta(
      "DELETE FROM PLANILLA WHERE id = ? AND estado = 'borrador'",
      [datos.id]
    );
  }

  async CambiarEstado(datos) {
    const transiciones = {
      borrador:  "procesada",
      procesada: "aprobada",
      aprobada:  "pagada",
      pagada:    "cerrada",
      atrasada:  "aprobada",
    };

    const rows = await ejecutarConsulta("SELECT * FROM PLANILLA WHERE id = ?", [datos.planillaId]);
    if (!rows.length) throw new Error("Planilla no encontrada");

    const planilla = rows[0];
    const siguiente = transiciones[planilla.estado];
    if (!siguiente) throw new Error(`No se puede avanzar desde "${planilla.estado}"`);

    if (planilla.estado === "borrador") {
      const pagos = await ejecutarConsulta(
        "SELECT COUNT(*) AS total FROM PAGO WHERE planillaId = ?",
        [datos.planillaId]
      );
      if (!pagos[0].total)
        throw new Error("La planilla no tiene pagos generados. Usá la opción 'Generar pagos' antes de avanzar.");
    }

    const usuarioId = await ServicioUsuario.obtenerUsuarioId(datos.token);
    try {
      await ejecutarConsulta(
        `INSERT INTO AUDITORIA (usuarioId, tabla, operacion, registroId, campoModificado, valorAnterior, valorNuevo, descripcion)
         VALUES (?, 'PLANILLA', 'UPDATE', ?, 'estado', ?, ?, ?)`,
        [usuarioId ?? null, datos.planillaId, planilla.estado, siguiente,
          `Cambio estado planilla ${datos.planillaId}: ${planilla.estado} → ${siguiente}`]
      );
    } catch (e) { console.warn("AUDITORIA CambiarEstado:", e.message); }

    await ejecutarConsulta("UPDATE PLANILLA SET estado = ? WHERE id = ?", [siguiente, datos.planillaId]);
    return { estadoAnterior: planilla.estado, estadoNuevo: siguiente };
  }

  async Atraso(datos) {
  if (!datos.planillaId) throw new Error("planillaId es requerido");
  if (!datos.motivo)     throw new Error("El motivo es requerido");
  if (!datos.nuevaFechaPago) throw new Error("La nueva fecha de pago es requerida");

  const rows = await ejecutarConsulta("SELECT * FROM PLANILLA WHERE id = ?", [datos.planillaId]);
  if (!rows.length) throw new Error("Planilla no encontrada");
  const planilla = rows[0];

  const fechaFormateada = String(datos.nuevaFechaPago).split("T")[0];

  await ejecutarConsulta(
    "UPDATE PLANILLA SET estado = 'atrasada' WHERE id = ?",
    [datos.planillaId]
  );

  await ejecutarConsulta(
    "UPDATE PLANILLA SET fechaPago = ? WHERE id = ?",
    [fechaFormateada, datos.planillaId]
  );

  const usuarioId = await ServicioUsuario.obtenerUsuarioId(datos.token);
  try {
    await ejecutarConsulta(
      `INSERT INTO AUDITORIA (usuarioId, tabla, operacion, registroId, campoModificado, valorAnterior, valorNuevo, descripcion)
       VALUES (?, 'PLANILLA', 'UPDATE', ?, 'estado', ?, 'atrasada', ?)`,
      [
        usuarioId ?? null,
        datos.planillaId,
        planilla.estado,
        `Atraso planilla ${datos.planillaId} — Motivo: ${datos.motivo}. Nueva fecha: ${fechaFormateada}. ${datos.observaciones ?? ""}`,
      ]
    );
  } catch (e) { console.warn("AUDITORIA Atraso:", e.message); }

  return { estadoAnterior: planilla.estado, estadoNuevo: "atrasada" };
}



  async Previsualizar(planillaId, empleadosIds) {
    const rows = await ejecutarConsulta("SELECT * FROM PLANILLA WHERE id = ?", [planillaId]);
    if (!rows.length) throw new Error("Planilla no encontrada");
    const planilla = rows[0];

    const tiposDeduccion = await ejecutarConsulta(
      "SELECT * FROM TIPO_DEDUCCION WHERE obligatorio = TRUE AND estado = 'activo'"
    );

    let empleados;
    if (empleadosIds && empleadosIds.length > 0) {
      const ph = empleadosIds.map(() => "?").join(",");
      empleados = await ejecutarConsulta(
        `SELECT e.*, d.nombre AS departamento FROM EMPLEADO e
         LEFT JOIN DEPARTAMENTO d ON e.departamentoId = d.id
         WHERE e.estado = 'activo' AND e.id IN (${ph})`,
        empleadosIds
      );
    } else {
      empleados = await ejecutarConsulta(
        `SELECT e.*, d.nombre AS departamento FROM EMPLEADO e
         LEFT JOIN DEPARTAMENTO d ON e.departamentoId = d.id
         WHERE e.estado = 'activo'`
      );
    }

    let totalBruto = 0, totalDeducciones = 0, totalNeto = 0, totalCargas = 0;
    let totalCCSS = 0, totalRenta = 0;
    const resultado = [];

    for (const emp of empleados) {
      const asistencias = await obtenerAsistencias(emp.id, planilla.fechaInicio, planilla.fechaFin);
      const calc = calcularMontosPago(emp, asistencias, tiposDeduccion);

      resultado.push({
        empleadoId:          emp.id,
        nombre:              emp.nombre,
        apellido:            emp.apellido,
        cedula:              emp.cedula,
        departamento:        emp.departamento,
        salarioBase:         parseFloat(emp.salarioBase) || 0,
        asistenciaRegistros: asistencias.length,
        ...calc,
      });

      totalBruto       += calc.totalBruto;
      totalDeducciones += calc.totalDeducciones;
      totalNeto        += calc.salarioNeto;
      totalCargas      += calc.cargasCCSS + calc.bancoPopular;
      totalCCSS        += calc.ccssObrero;
      totalRenta       += calc.renta;
    }

    return {
      planilla,
      tiposDeduccionAplicados: tiposDeduccion,
      empleados: resultado,
      totales: {
        totalEmpleados:   resultado.length,
        totalBruto:       round2(totalBruto),
        totalDeducciones: round2(totalDeducciones),
        totalNeto:        round2(totalNeto),
        totalCCSS:        round2(totalCCSS),
        totalRenta:       round2(totalRenta),
        cargasPatronales: round2(totalCargas),
      },
    };
  }



  async GenerarPagos(datos) {
    const rows = await ejecutarConsulta("SELECT * FROM PLANILLA WHERE id = ?", [datos.planillaId]);
    if (!rows.length) throw new Error("Planilla no encontrada");
    const planilla = rows[0];
    if (planilla.estado !== "borrador")
      throw new Error(`Solo se generan pagos en estado borrador (actual: "${planilla.estado}")`);

    const tiposDeduccion = await ejecutarConsulta(
      "SELECT * FROM TIPO_DEDUCCION WHERE obligatorio = TRUE AND estado = 'activo'"
    );

    await ejecutarConsulta(
      "DELETE FROM DEDUCCION_PAGO WHERE pagoId IN (SELECT id FROM PAGO WHERE planillaId = ?)",
      [datos.planillaId]
    );
    await ejecutarConsulta("DELETE FROM PAGO WHERE planillaId = ?", [datos.planillaId]);

    let empleados;
    const ids = datos.empleadosIds && datos.empleadosIds.length > 0 ? datos.empleadosIds : null;
    if (ids) {
      const ph = ids.map(() => "?").join(",");
      empleados = await ejecutarConsulta(
        `SELECT * FROM EMPLEADO WHERE estado = 'activo' AND id IN (${ph})`, ids
      );
    } else {
      empleados = await ejecutarConsulta("SELECT * FROM EMPLEADO WHERE estado = 'activo'");
    }

    if (!empleados.length) throw new Error("No hay empleados activos para procesar");

    const usuarioId = await ServicioUsuario.obtenerUsuarioId(datos.token);
    const pagosGenerados = [];

    for (const emp of empleados) {
      const asistencias = await obtenerAsistencias(emp.id, planilla.fechaInicio, planilla.fechaFin);
      const calc = calcularMontosPago(emp, asistencias, tiposDeduccion);

      try {
        await ejecutarConsulta(
          `INSERT INTO AUDITORIA (usuarioId, tabla, operacion, registroId, campoModificado, valorAnterior, valorNuevo, descripcion)
           VALUES (?, 'PAGO', 'INSERT', 0, 'todos', NULL, ?, ?)`,
          [usuarioId ?? null,
            `empleado:${emp.id}, horas:${calc.horasTrabajadas}, neto:${calc.salarioNeto}`,
            `Pago generado: ${emp.nombre} ${emp.apellido} — planilla ${datos.planillaId} — ${calc.horasTrabajadas}h trabajadas`]
        );
      } catch (e) { console.warn("AUDITORIA GenerarPagos:", e.message); }

      let pagoRes;
      try {
        pagoRes = await ejecutarConsulta(
          `INSERT INTO PAGO
             (empleadoId, planillaId, salarioBase, diasTrabajados, diasEsperados,
              horasExtras, totalBruto, totalDeducciones, totalBonificaciones, salarioNeto, observaciones)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            emp.id, datos.planillaId, parseFloat(emp.salarioBase) || 0,
            calc.diasTrabajados, 30, calc.horasExtras,
            calc.totalBruto, calc.totalDeducciones, 0, calc.salarioNeto,
            `${calc.horasTrabajadas}h trabajadas / ${calc.horasExtras}h extra — valor hora: ₡${calc.valorHora}`,
          ]
        );
      } catch (e) {
        console.error(`Error INSERT PAGO empleado ${emp.id}:`, e.message);
        throw new Error(`Error al insertar pago para ${emp.nombre} ${emp.apellido}: ${e.message}`);
      }

      if (!pagoRes || !pagoRes.insertId)
        throw new Error(`INSERT PAGO no retornó insertId para ${emp.nombre} ${emp.apellido}.`);

      for (const deduccion of calc.deduccionesCalculadas) {
        if (deduccion.monto > 0) {
          try {
            await ejecutarConsulta(
              `INSERT INTO DEDUCCION_PAGO (pagoId, tipoDeduccionId, monto, observaciones)
               VALUES (?, ?, ?, ?)`,
              [pagoRes.insertId, deduccion.tipoDeduccionId, deduccion.monto,
                `${deduccion.nombre} — calculado automáticamente`]
            );
          } catch (e) { console.warn(`DEDUCCION_PAGO ${deduccion.codigo}:`, e.message); }
        }
      }

      pagosGenerados.push({
        empleadoId:       emp.id,
        nombre:           `${emp.nombre} ${emp.apellido}`,
        horasTrabajadas:  calc.horasTrabajadas,
        valorHora:        calc.valorHora,
        totalBruto:       calc.totalBruto,
        totalDeducciones: calc.totalDeducciones,
        salarioNeto:      calc.salarioNeto,
        deducciones:      calc.deduccionesCalculadas,
      });
    }

    await ejecutarConsulta(
      "UPDATE PLANILLA SET estado = 'procesada' WHERE id = ?",
      [datos.planillaId]
    );

    return { mensaje: "Planilla procesada correctamente", pagosGenerados, total: pagosGenerados.length };
  }



  async ReportePlanilla(planillaId) {
    const rows = await ejecutarConsulta("SELECT * FROM PLANILLA WHERE id = ?", [planillaId]);
    if (!rows.length) throw new Error("Planilla no encontrada");

    const pagos = await ejecutarConsulta(
      `SELECT p.*, e.nombre, e.apellido, e.cedula, d.nombre AS departamento
       FROM PAGO p
       JOIN EMPLEADO e ON p.empleadoId = e.id
       JOIN DEPARTAMENTO d ON e.departamentoId = d.id
       WHERE p.planillaId = ?
       ORDER BY d.nombre, e.apellido`,
      [planillaId]
    );

    const totales = {
      totalBruto:          round2(pagos.reduce((s, p) => s + parseFloat(p.totalBruto || 0), 0)),
      totalDeducciones:    round2(pagos.reduce((s, p) => s + parseFloat(p.totalDeducciones || 0), 0)),
      totalBonificaciones: round2(pagos.reduce((s, p) => s + parseFloat(p.totalBonificaciones || 0), 0)),
      totalNeto:           round2(pagos.reduce((s, p) => s + parseFloat(p.salarioNeto || 0), 0)),
      cantidadEmpleados:   pagos.length,
    };
    totales.cargasPatronales = round2(totales.totalBruto * 0.2717);
    totales.costoTotalEmpresa = round2(totales.totalBruto + totales.cargasPatronales);

    return { planilla: rows[0], pagos, totales };
  }

  async ReportePorDepartamento(planillaId) {
    const rows = await ejecutarConsulta("SELECT * FROM PLANILLA WHERE id = ?", [planillaId]);
    if (!rows.length) throw new Error("Planilla no encontrada");

    const grupos = await ejecutarConsulta(
      `SELECT d.id AS depId, d.nombre AS departamento,
              COUNT(p.id) AS empleados,
              SUM(p.totalBruto)          AS totalBruto,
              SUM(p.totalDeducciones)    AS totalDeducciones,
              SUM(p.totalBonificaciones) AS totalBonificaciones,
              SUM(p.salarioNeto)         AS totalNeto,
              AVG(p.salarioNeto)         AS promedioNeto
       FROM PAGO p
       JOIN EMPLEADO e ON p.empleadoId = e.id
       JOIN DEPARTAMENTO d ON e.departamentoId = d.id
       WHERE p.planillaId = ?
       GROUP BY d.id, d.nombre
       ORDER BY d.nombre`,
      [planillaId]
    );

    return { planilla: rows[0], porDepartamento: grupos };
  }
}

module.exports = new ServicioPlanilla();