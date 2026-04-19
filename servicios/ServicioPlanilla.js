const { ejecutarConsulta } = require("../db.js");
const ServicioUsuario = require("./ServicioUsuario.js");

// ── Helpers ───────────────────────────────────────────────────────────────────

function round2(n) { return Math.round(n * 100) / 100; }

/**
 * ISR Costa Rica — escala MH mensual 2025 (progresiva)
 * Tramo 1: hasta ₡942,625       → 0%
 * Tramo 2: ₡942,626–₡1,357,072 → 15% sobre el exceso
 * Tramo 3: más de ₡1,357,072   → 25% sobre el exceso adicional
 */
function calcularRenta(bruto) {
  let renta = 0;
  if (bruto > 942625)  renta += Math.min(bruto - 942625, 1357072 - 942625) * 0.15;
  if (bruto > 1357072) renta += (bruto - 1357072) * 0.25;
  return renta;
}

/**
 * Calcula todos los montos de un pago dado el empleado y sus asistencias del período.
 * salarioProporcional = salarioBase / 30 * diasTrabajados
 * horasExtras         = (salarioBase / 30 / 8) * 1.5 * horasExtras
 * CCSS obrero         = bruto × 9.67%
 * Cargas patronales   = bruto × 26.67% + bruto × 0.5% (Banco Popular) — informativas
 */
function calcularMontosPago(emp, asistencias) {
  const salarioBase      = parseFloat(emp.salarioBase) || 0;
  const diasTrabajados   = asistencias.length;
  const horasExtrasTotal = asistencias.reduce((s, a) => s + (parseFloat(a.horasExtras) || 0), 0);

  const salarioProporcional = (salarioBase / 30) * diasTrabajados;
  const pagoHorasExtras     = (salarioBase / 30 / 8) * 1.5 * horasExtrasTotal;
  const totalBruto          = salarioProporcional + pagoHorasExtras;

  const ccssObrero          = totalBruto * 0.0967;
  const renta               = calcularRenta(totalBruto);
  const totalDeducciones    = ccssObrero + renta;
  const salarioNeto         = totalBruto - totalDeducciones;
  const cargasCCSS          = totalBruto * 0.2667;
  const bancoPOpular        = totalBruto * 0.005;

  return {
    diasTrabajados,
    horasExtras:         round2(horasExtrasTotal),
    salarioProporcional: round2(salarioProporcional),
    pagoHorasExtras:     round2(pagoHorasExtras),
    totalBruto:          round2(totalBruto),
    ccssObrero:          round2(ccssObrero),
    renta:               round2(renta),
    totalDeducciones:    round2(totalDeducciones),
    salarioNeto:         round2(salarioNeto),
    cargasCCSS:          round2(cargasCCSS),
    bancoPOpular:        round2(bancoPOpular),
  };
}

// ── Clase principal ───────────────────────────────────────────────────────────

class ServicioPlanilla {
  constructor() {}

  // ── PLANILLA ──────────────────────────────────────────────────────────────

  async Read(datos) {
    return await ejecutarConsulta("SELECT * FROM PLANILLA WHERE periodo LIKE ?", [`%${datos.periodo}%`]);
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
      [datos.periodo, datos.fechaInicio, datos.fechaFin, datos.fechaPago,
       datos.estado ?? "borrador", datos.descripcion ?? "",
       datos.creadoPor > 0 ? datos.creadoPor : null]
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
      `UPDATE PLANILLA SET periodo=?, fechaInicio=?, fechaFin=?, fechaPago=?, estado=?,
       descripcion=?, creadoPor=?, aprobadoPor=? WHERE id=?`,
      [datos.periodo, datos.fechaInicio, datos.fechaFin, datos.fechaPago,
       datos.estado, datos.descripcion, datos.creadoPor, datos.aprobadoPor, datos.id]
    );
  }

  // ── Delete (solo borradores) ───────────────────────────────────────────────

  async Delete(datos) {
    const rows = await ejecutarConsulta("SELECT estado FROM PLANILLA WHERE id = ?", [datos.id]);
    if (!rows.length) throw new Error("Planilla no encontrada");
    if (rows[0].estado !== "borrador") throw new Error("Solo se pueden eliminar planillas en estado borrador");
    await ejecutarConsulta("DELETE FROM PAGO WHERE planillaId = ?", [datos.id]);
    return await ejecutarConsulta("DELETE FROM PLANILLA WHERE id = ? AND estado = 'borrador'", [datos.id]);
  }

  // ── CambiarEstado ─────────────────────────────────────────────────────────

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

  // ── Atraso ────────────────────────────────────────────────────────────────

  async Atraso(datos) {
    const rows = await ejecutarConsulta("SELECT * FROM PLANILLA WHERE id = ?", [datos.planillaId]);
    if (!rows.length) throw new Error("Planilla no encontrada");
    const planilla = rows[0];

    await ejecutarConsulta(
      "UPDATE PLANILLA SET estado = 'atrasada', fechaPago = ? WHERE id = ?",
      [datos.nuevaFechaPago, datos.planillaId]
    );

    const usuarioId = await ServicioUsuario.obtenerUsuarioId(datos.token);
    try {
      await ejecutarConsulta(
        `INSERT INTO AUDITORIA (usuarioId, tabla, operacion, registroId, campoModificado, valorAnterior, valorNuevo, descripcion)
         VALUES (?, 'PLANILLA', 'UPDATE', ?, 'estado', ?, 'atrasada', ?)`,
        [usuarioId ?? null, datos.planillaId, planilla.estado,
         `Atraso planilla ${datos.planillaId} — Motivo: ${datos.motivo}. Nueva fecha: ${datos.nuevaFechaPago}. ${datos.observaciones ?? ""}`]
      );
    } catch (e) { console.warn("AUDITORIA Atraso:", e.message); }

    return { estadoAnterior: planilla.estado, estadoNuevo: "atrasada" };
  }

  // ── Previsualizar ─────────────────────────────────────────────────────────

  async Previsualizar(planillaId, empleadosIds) {
    const rows = await ejecutarConsulta("SELECT * FROM PLANILLA WHERE id = ?", [planillaId]);
    if (!rows.length) throw new Error("Planilla no encontrada");
    const planilla = rows[0];

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

    let totalBruto = 0, totalCCSS = 0, totalRenta = 0, totalNeto = 0, totalCargas = 0;
    const resultado = [];

    for (const emp of empleados) {
      const asistencias = await ejecutarConsulta(
        "SELECT * FROM ASISTENCIA WHERE empleadoId = ? AND fecha BETWEEN ? AND ?",
        [emp.id, planilla.fechaInicio, planilla.fechaFin]
      );
      const calc = calcularMontosPago(emp, asistencias);
      resultado.push({
        empleadoId: emp.id, nombre: emp.nombre, apellido: emp.apellido,
        cedula: emp.cedula, departamento: emp.departamento,
        salarioBase: parseFloat(emp.salarioBase) || 0,
        asistenciaRegistros: asistencias.length,
        ...calc,
      });
      totalBruto += calc.totalBruto;
      totalCCSS  += calc.ccssObrero;
      totalRenta += calc.renta;
      totalNeto  += calc.salarioNeto;
      totalCargas += calc.cargasCCSS + calc.bancoPOpular;
    }

    return {
      planilla,
      empleados: resultado,
      totales: {
        totalEmpleados: resultado.length,
        totalBruto:       round2(totalBruto),
        totalCCSS:        round2(totalCCSS),
        totalRenta:       round2(totalRenta),
        totalDeducciones: round2(totalCCSS + totalRenta),
        totalNeto:        round2(totalNeto),
        cargasPatronales: round2(totalCargas),
      }
    };
  }

  // ── GenerarPagos ──────────────────────────────────────────────────────────

  async GenerarPagos(datos) {
    const rows = await ejecutarConsulta("SELECT * FROM PLANILLA WHERE id = ?", [datos.planillaId]);
    if (!rows.length) throw new Error("Planilla no encontrada");
    const planilla = rows[0];
    if (planilla.estado !== "borrador")
      throw new Error(`Solo se generan pagos en estado borrador (actual: "${planilla.estado}")`);

    // Limpiar pagos previos
    await ejecutarConsulta("DELETE FROM DEDUCCION_PAGO WHERE pagoId IN (SELECT id FROM PAGO WHERE planillaId = ?)", [datos.planillaId]);
    await ejecutarConsulta("DELETE FROM PAGO WHERE planillaId = ?", [datos.planillaId]);

    // Obtener tipos de deducción para CCSS e ISR
    const [tiposCCSS] = await ejecutarConsulta(
      "SELECT * FROM TIPO_DEDUCCION WHERE (codigo LIKE '%CCSS%' OR nombre LIKE '%CCSS%') AND estado = 'activo' LIMIT 1"
    ).catch(() => [[]]);
    const [tiposISR] = await ejecutarConsulta(
      "SELECT * FROM TIPO_DEDUCCION WHERE (codigo LIKE '%ISR%' OR nombre LIKE '%Renta%' OR nombre LIKE '%renta%') AND estado = 'activo' LIMIT 1"
    ).catch(() => [[]]);

    const ccssTipo = Array.isArray(tiposCCSS) ? tiposCCSS : tiposCCSS;
    const isrTipo  = Array.isArray(tiposISR)  ? tiposISR  : tiposISR;

    // Empleados a procesar
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

    const usuarioId = await ServicioUsuario.obtenerUsuarioId(datos.token);
    const pagosGenerados = [];

    for (const emp of empleados) {
      const asistencias = await ejecutarConsulta(
        "SELECT * FROM ASISTENCIA WHERE empleadoId = ? AND fecha BETWEEN ? AND ?",
        [emp.id, planilla.fechaInicio, planilla.fechaFin]
      );
      const calc = calcularMontosPago(emp, asistencias);

      try {
        await ejecutarConsulta(
          `INSERT INTO AUDITORIA (usuarioId, tabla, operacion, registroId, campoModificado, valorAnterior, valorNuevo, descripcion)
           VALUES (?, 'PAGO', 'INSERT', 0, 'todos', NULL, ?, ?)`,
          [usuarioId ?? null,
           `empleado:${emp.id}, neto:${calc.salarioNeto}`,
           `Pago generado: ${emp.nombre} ${emp.apellido} — planilla ${datos.planillaId}`]
        );
      } catch (e) { console.warn("AUDITORIA GenerarPagos:", e.message); }

      const pagoRes = await ejecutarConsulta(
        `INSERT INTO PAGO (empleadoId, planillaId, salarioBase, diasTrabajados, diasEsperados,
         horasExtras, totalBruto, totalDeducciones, totalBonificaciones, salarioNeto, observaciones)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [emp.id, datos.planillaId, emp.salarioBase, calc.diasTrabajados, 30,
         calc.horasExtras, calc.totalBruto, calc.totalDeducciones, 0,
         calc.salarioNeto, `Generado automáticamente — ${calc.diasTrabajados} días trabajados`]
      );

      const pagoId = pagoRes.insertId;

      // DEDUCCION_PAGO para CCSS
      if (pagoId && ccssTipo && ccssTipo.id && calc.ccssObrero > 0) {
        await ejecutarConsulta(
          "INSERT INTO DEDUCCION_PAGO (pagoId, tipoDeduccionId, monto, observaciones) VALUES (?, ?, ?, ?)",
          [pagoId, ccssTipo.id, calc.ccssObrero, "CCSS Obrero 9.67%"]
        ).catch(e => console.warn("DEDUCCION_PAGO CCSS:", e.message));
      }
      // DEDUCCION_PAGO para ISR
      if (pagoId && isrTipo && isrTipo.id && calc.renta > 0) {
        await ejecutarConsulta(
          "INSERT INTO DEDUCCION_PAGO (pagoId, tipoDeduccionId, monto, observaciones) VALUES (?, ?, ?, ?)",
          [pagoId, isrTipo.id, calc.renta, "Impuesto sobre la Renta"]
        ).catch(e => console.warn("DEDUCCION_PAGO ISR:", e.message));
      }

      pagosGenerados.push({ empleadoId: emp.id, nombre: `${emp.nombre} ${emp.apellido}`, salarioNeto: calc.salarioNeto });
    }

    // Avanzar planilla a procesada
    await ejecutarConsulta("UPDATE PLANILLA SET estado = 'procesada' WHERE id = ?", [datos.planillaId]);

    return { pagosGenerados, total: pagosGenerados.length };
  }

  // ── ReportePlanilla ───────────────────────────────────────────────────────

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
      totalBruto:          pagos.reduce((s, p) => s + parseFloat(p.totalBruto || 0), 0),
      totalDeducciones:    pagos.reduce((s, p) => s + parseFloat(p.totalDeducciones || 0), 0),
      totalBonificaciones: pagos.reduce((s, p) => s + parseFloat(p.totalBonificaciones || 0), 0),
      totalNeto:           pagos.reduce((s, p) => s + parseFloat(p.salarioNeto || 0), 0),
      cantidadEmpleados:   pagos.length,
    };
    totales.cargasPatronales = round2(totales.totalBruto * 0.2717); // CCSS pat + BP
    totales.costoTotalEmpresa = round2(totales.totalBruto + totales.cargasPatronales);

    return { planilla: rows[0], pagos, totales };
  }

  // ── ReportePorDepartamento ────────────────────────────────────────────────

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
