import { Component, inject, signal, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe, NgStyle } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificacionService } from '../notificacion.service';


// INTERFACES


interface Planilla {
  id: number; periodo: string; fechaInicio: string; fechaFin: string;
  fechaPago: string; estado: string; descripcion: string;
  creadoPor: number; aprobadoPor: number; creacion: string;
}
interface Pago {
  id: number; empleadoId: number; planillaId: number; salarioBase: number;
  diasTrabajados: number; diasEsperados: number; horasExtras: number;
  totalBruto: number; totalDeducciones: number; totalBonificaciones: number;
  salarioNeto: number; observaciones: string;
}
interface Empleado { id: number; nombre: string; apellido: string; cedula: string; salarioBase: number; estado: string; }
interface Usuario  { id: number; nombreUsuario: string; rol: string; }
interface HistorialSalario {
  id: number; empleadoId: number; salarioAnterior: number; salarioNuevo: number;
  fechaCambio: string; motivo: string; autorizadoPor: number;
}
interface PrevEmp {
  empleadoId: number; nombre: string; apellido: string; cedula: string; departamento: string;
  salarioBase: number; asistenciaRegistros: number; diasTrabajados: number; horasExtras: number;
  salarioProporcional: number; pagoHorasExtras: number; totalBruto: number;
  ccssObrero: number; renta: number; totalDeducciones: number; salarioNeto: number;
  cargasCCSS: number; bancoPopular: number;
}
interface PrevResult { planilla: Planilla; empleados: PrevEmp[]; totales: any; }
interface TipoDeduccion {
  id: number; codigo: string; nombre: string;
  porcentaje: number | null; montoFijo: number | null; obligatorio: boolean;
}
interface DeduccionPago {
  id: number; pagoId: number; tipoDeduccionId: number;
  monto: number; observaciones: string; nombre?: string; codigo?: string;
}
interface TipoBonificacion {
  id: number; codigo: string; nombre: string; descripcion: string; estado: string;
}
interface BonificacionPago {
  id: number; pagoId: number; tipoBonificacionId: number;
  monto: number; observaciones: string; nombre?: string; codigo?: string;
}

type Tab = 'resumen' | 'procesar' | 'historial';


// COMPONENTE


@Component({
  selector: 'app-planilla-detalle',
  standalone: true,
  imports: [FormsModule, TitleCasePipe, NgStyle],
  templateUrl: './planilla-detalle.html',
  styleUrl: './planilla-detalle.css',
})
export class PlanillaDetalle implements OnInit {
  private readonly http     = inject(HttpClient);
  private readonly router   = inject(Router);
  private readonly route    = inject(ActivatedRoute);
  private readonly notifSvc = inject(NotificacionService);


  private readonly apiDeducUrl     = 'http://localhost/ServicioDeduccionPago/';
  private readonly apiTipoUrl      = 'http://localhost/ServicioTipoDeduccion/';
  private readonly apiBonifUrl     = 'http://localhost/ServicioBonificacionPago/';
  private readonly apiTipoBonifUrl = 'http://localhost/ServicioTipoBonificacion/';
  private readonly apiPagoUrl      = 'http://localhost/ServicioPago/';

  protected planillaId = 0;
  protected tab: Tab = 'resumen';
  protected confirmarEliminar = false;

  protected readonly planilla  = signal<Planilla | null>(null);
  protected readonly pagos     = signal<Pago[]>([]);
  protected readonly usuarios  = signal<Usuario[]>([]);
  protected readonly empleados = signal<Empleado[]>([]);
  protected readonly historial = signal<HistorialSalario[]>([]);

  protected readonly paso      = signal(0);
  protected readonly previsualizacion = signal<PrevResult | null>(null);
  protected seleccionados = new Set<number>();
  protected procesando    = false;
  protected empDetalle: PrevEmp | null = null;
  protected setPaso(n: number) { this.paso.set(n); }


  protected readonly tiposDeduccion  = signal<TipoDeduccion[]>([]);
  protected readonly deduccionesPago = signal<DeduccionPago[]>([]);
  protected mostrandoModalDeducciones    = false;
  protected mostrandoModalNuevaDeduccion = false;
  protected pagoSeleccionado: Pago | null = null;
  protected formDeduccion = { tipoDeduccionId: 0, montoManual: 0, observaciones: '' };
  protected deduccionAEliminar: DeduccionPago | null = null;

  protected readonly tiposBonificacion  = signal<TipoBonificacion[]>([]);
  protected readonly bonificacionesPago = signal<BonificacionPago[]>([]);
  protected mostrandoModalBonificaciones    = false;
  protected mostrandoModalNuevaBonificacion = false;
  protected pagoSeleccionadoBonif: Pago | null = null;
  protected formBonificacion = { tipoBonificacionId: 0, montoManual: 0, observaciones: '' };
  protected bonificacionAEliminar: BonificacionPago | null = null;
  
  protected mostrarFormSalario = false;
  protected enviandoSalario    = false;
  protected formSalario = { empleadoId: 0, salarioAnterior: 0, salarioNuevo: 0, motivo: '', autorizadoPor: 0 };

 

  ngOnInit() {
    this.planillaId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAll();
  }

  private loadAll() {
    this.http.get<Planilla[]>('http://localhost/ServicioPlanilla/ReadAll').subscribe({
      next: (list) => { const p = list.find(x => x.id === this.planillaId); if (p) this.planilla.set(p); },
      error: () => {}
    });
    this.http.get<Pago[]>('http://localhost/ServicioPago/ReadAll').subscribe({
      next: (d) => this.pagos.set(d.filter(p => p.planillaId === this.planillaId)),
      error: () => {}
    });
    this.http.get<Usuario[]>('http://localhost/ServicioUsuario/ReadAll').subscribe({
      next: (d) => this.usuarios.set(d), error: () => {}
    });
    this.http.get<Empleado[]>('http://localhost/ServicioEmpleado/ReadAll').subscribe({
      next: (d) => {
        this.empleados.set(d.filter(e => e.estado === 'activo'));
        d.filter(e => e.estado === 'activo').forEach(e => this.seleccionados.add(e.id));
      }, error: () => {}
    });
    this.http.get<HistorialSalario[]>('http://localhost/ServicioHistorialSalario/ReadAll').subscribe({
      next: (d) => this.historial.set(d), error: () => {}
    });
    this.http.get<TipoDeduccion[]>(this.apiTipoUrl + 'ReadAll').subscribe({
      next: (d) => this.tiposDeduccion.set(d), error: () => {}
    });
    this.http.get<TipoBonificacion[]>(this.apiTipoBonifUrl + 'ReadAll').subscribe({
      next: (d) => this.tiposBonificacion.set(d.filter(t => t.estado === 'activo')),
      error: () => {}
    });
  }

 

  protected fmtFecha(val: string): string { return val ? val.split('T')[0] : '—'; }

  protected fmtMoneda(val: number): string {
    if (val == null) return '₡0';
    return '₡' + Number(val).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  protected nombreUsuario(id: number): string {
    return this.usuarios().find(u => u.id === id)?.nombreUsuario ?? (id > 0 ? `Usuario #${id}` : '—');
  }

  protected nombreEmpleado(id: number): string {
    const e = this.empleados().find(e => e.id === id);
    return e ? `${e.nombre} ${e.apellido}` : `#${id}`;
  }

  

  protected get totalBruto(): number          { return this.pagos().reduce((s, p) => s + (parseFloat(String(p.totalBruto)) || 0), 0); }
  protected get totalDeducciones(): number    { return this.pagos().reduce((s, p) => s + (parseFloat(String(p.totalDeducciones)) || 0), 0); }
  protected get totalBonificaciones(): number { return this.pagos().reduce((s, p) => s + (parseFloat(String(p.totalBonificaciones)) || 0), 0); }
  protected get totalNeto(): number           { return this.pagos().reduce((s, p) => s + (parseFloat(String(p.salarioNeto)) || 0), 0); }

 

  protected readonly ESTADOS_TIMELINE = ['borrador','procesada','aprobada','pagada','cerrada'];

  protected estadoIndex(est: string): number { return this.ESTADOS_TIMELINE.indexOf(est); }

  protected estadoActualIndex(): number {
    const p = this.planilla(); if (!p) return 0;
    return this.estadoIndex(p.estado === 'atrasada' ? 'procesada' : p.estado);
  }

  protected badgeStyle(estado: string) {
    const map: Record<string, { bg: string; color: string; border: string }> = {
      borrador:  { bg: '#f3f4f6', color: '#374151', border: '#9ca3af' },
      procesada: { bg: '#eff6ff', color: '#1d4ed8', border: '#3b82f6' },
      aprobada:  { bg: '#fffbeb', color: '#92400e', border: '#f59e0b' },
      pagada:    { bg: '#f0fdf4', color: '#065f46', border: '#22c55e' },
      cerrada:   { bg: '#faf5ff', color: '#5b21b6', border: '#a855f7' },
      atrasada:  { bg: '#fef2f2', color: '#991b1b', border: '#ef4444' },
    };
    const s = map[estado] ?? map['borrador'];
    return { background: s.bg, color: s.color, border: `1px solid ${s.border}` };
  }


  // ACCIONES DE PLANILLA
 

  protected cambiarEstado() {
    const p = this.planilla(); if (!p) return;
    this.http.post('http://localhost/ServicioPlanilla/CambiarEstado', { planillaId: p.id }).subscribe({
      next: (res: any) => { this.loadAll(); this.notifSvc.mostrar(`Planilla avanzada a "${res.estadoNuevo}"`); },
      error: (e) => this.notifSvc.mostrar(e.error?.error ?? 'Error al cambiar estado', 'error'),
    });
  }

  protected eliminarPlanilla() {
    const p = this.planilla(); if (!p) return;
    this.http.post('http://localhost/ServicioPlanilla/Delete', { id: p.id }).subscribe({
      next: () => { this.notifSvc.mostrar('Planilla eliminada'); this.router.navigate(['/planilla']); },
      error: (e) => this.notifSvc.mostrar(e.error?.error ?? 'Error al eliminar', 'error'),
    });
    this.confirmarEliminar = false;
  }

  protected navAtraso() { this.router.navigate(['/planilla', this.planillaId, 'atraso']); }
  protected volver()    { this.router.navigate(['/planilla']); }


  // EXPORTAR / IMPRIMIR

  protected exportarCSV() {
    const cabecera = ['Empleado', 'Días', 'Hrs Extra', 'Bruto', 'Deducciones', 'Bonificaciones', 'Neto'];
    const filas = this.pagos().map(p => [
      this.nombreEmpleado(p.empleadoId),
      p.diasTrabajados, p.horasExtras,
      p.totalBruto, p.totalDeducciones, p.totalBonificaciones, p.salarioNeto
    ]);
    const csv = [cabecera, ...filas].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `planilla-${this.planillaId}.csv`;
    a.click();
  }

  private get pdfStyles(): string {
    return `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; color: #1e293b; }
      .pagina { max-width: 900px; margin: 0 auto; background: #fff; }
      .pdf-header {
        background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
        color: #fff; padding: 24px 32px; display: flex;
        justify-content: space-between; align-items: center;
      }
      .pdf-empresa { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
      .pdf-empresa span { color: #93c5fd; }
      .pdf-empresa-sub { font-size: 11px; opacity: 0.75; margin-top: 2px; }
      .pdf-doc-tipo { text-align: right; }
      .pdf-doc-tipo .titulo { font-size: 15px; font-weight: 700; }
      .pdf-doc-tipo .subtitulo { font-size: 11px; opacity: 0.75; margin-top: 3px; }
      .pdf-meta {
        background: #eff6ff; border-bottom: 1px solid #bfdbfe;
        padding: 12px 32px; display: flex; gap: 32px; flex-wrap: wrap;
      }
      .pdf-meta-item { font-size: 11px; color: #1e40af; }
      .pdf-meta-item strong { display: block; font-size: 13px; color: #1e3a5f; margin-top: 1px; }
      .pdf-body { padding: 24px 32px; }
      table { width: 100%; border-collapse: collapse; font-size: 11.5px; margin-top: 12px; }
      thead tr { background: #1e3a5f; color: #fff; }
      thead th { padding: 8px 10px; text-align: left; font-weight: 600; }
      thead th.r { text-align: right; }
      tbody tr:nth-child(even) { background: #f0f7ff; }
      tbody tr:hover { background: #dbeafe; }
      td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; }
      td.r { text-align: right; }
      td.c { text-align: center; }
      td.neto { font-weight: 700; color: #15803d; }
      td.neg { color: #b91c1c; }
      tfoot tr { background: #1e3a5f; color: #fff; }
      tfoot td { padding: 9px 10px; font-weight: 700; }
      .sec-title {
        font-size: 10px; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.1em; color: #2563eb; border-bottom: 2px solid #bfdbfe;
        padding-bottom: 4px; margin: 20px 0 8px;
      }
      .dato-fila { display: flex; justify-content: space-between; padding: 5px 0;
                   border-bottom: 1px solid #f1f5f9; font-size: 12px; }
      .dato-fila .lbl { color: #64748b; }
      .dato-fila .val { font-weight: 500; color: #1e293b; }
      .dato-fila.total-row {
        background: #1e3a5f; color: #fff; padding: 10px 14px;
        border-radius: 8px; margin-top: 12px; border: none;
      }
      .dato-fila.total-row .lbl { color: #93c5fd; font-weight: 700; font-size: 13px; }
      .dato-fila.total-row .val { color: #fff; font-weight: 800; font-size: 16px; }
      .pdf-footer {
        margin-top: 32px; padding: 12px 32px;
        border-top: 1px solid #e2e8f0; font-size: 10px;
        color: #94a3b8; text-align: center;
      }
      @media print {
        @page { margin: 10mm; size: A4 landscape; }
        body { background: #fff; }
        .pagina { max-width: 100%; }
      }`;
  }

  protected imprimirPDF() {
    const p = this.planilla(); if (!p) return;
    const filas = this.pagos().map(pago => `
      <tr>
        <td>${this.nombreEmpleado(pago.empleadoId)}</td>
        <td class="c">${pago.diasTrabajados}</td>
        <td class="c">${pago.horasExtras}</td>
        <td class="r">${this.fmtMoneda(pago.totalBruto)}</td>
        <td class="r neg">${this.fmtMoneda(pago.totalDeducciones)}</td>
        <td class="r" style="color:#15803d">${this.fmtMoneda(pago.totalBonificaciones)}</td>
        <td class="r neto">${this.fmtMoneda(pago.salarioNeto)}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
      <title>Planilla ${p.periodo} — SalaryCenter</title>
      <style>${this.pdfStyles}</style></head><body>
      <div class="pagina">
        <div class="pdf-header">
          <div>
            <div class="pdf-empresa">Salary<span>Center</span></div>
            <div class="pdf-empresa-sub">Sistema de Gestión de Planillas</div>
          </div>
          <div class="pdf-doc-tipo">
            <div class="titulo">Reporte de Planilla</div>
            <div class="subtitulo">Generado el ${new Date().toLocaleDateString('es-CR')}</div>
          </div>
        </div>
        <div class="pdf-meta">
          <div class="pdf-meta-item">Período<strong>${p.periodo}</strong></div>
          <div class="pdf-meta-item">Fecha inicio<strong>${this.fmtFecha(p.fechaInicio)}</strong></div>
          <div class="pdf-meta-item">Fecha fin<strong>${this.fmtFecha(p.fechaFin)}</strong></div>
          <div class="pdf-meta-item">Fecha de pago<strong>${this.fmtFecha(p.fechaPago)}</strong></div>
          <div class="pdf-meta-item">Estado<strong>${p.estado.toUpperCase()}</strong></div>
          <div class="pdf-meta-item">Empleados<strong>${this.pagos().length}</strong></div>
        </div>
        <div class="pdf-body">
          <div class="sec-title">Detalle de pagos por empleado</div>
          <table>
            <thead><tr>
              <th>Empleado</th><th class="r">Días</th><th class="r">Hrs extra</th>
              <th class="r">Total bruto</th><th class="r">Deducciones</th>
              <th class="r">Bonificaciones</th><th class="r">Salario neto</th>
            </tr></thead>
            <tbody>${filas}</tbody>
            <tfoot><tr>
              <td colspan="3">TOTALES</td>
              <td class="r">${this.fmtMoneda(this.totalBruto)}</td>
              <td class="r">${this.fmtMoneda(this.totalDeducciones)}</td>
              <td class="r">${this.fmtMoneda(this.totalBonificaciones)}</td>
              <td class="r">${this.fmtMoneda(this.totalNeto)}</td>
            </tr></tfoot>
          </table>
        </div>
        <div class="pdf-footer">SalaryCenter · ISW-811 Diseño Web · © 2025 Thaylin Barrueta &amp; Fabricio Sequeira</div>
      </div>
      <script>window.onload = function(){ window.print(); }<\/script>
      </body></html>`;

    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  }

  protected verComprobante(pago: Pago) {
    const p = this.planilla(); if (!p) return;
    const emp    = this.empleados().find(e => e.id === pago.empleadoId);
    const nombre = emp ? `${emp.nombre} ${emp.apellido}` : `Empleado #${pago.empleadoId}`;
    const cedula = emp?.cedula ?? '—';

    Promise.all([
      lastValueFrom(this.http.get<DeduccionPago[]>(this.apiDeducUrl + `ReadPorPago?pagoId=${pago.id}`)).catch(() => [] as DeduccionPago[]),
      lastValueFrom(this.http.get<BonificacionPago[]>(this.apiBonifUrl + `ReadPorPago?pagoId=${pago.id}`)).catch(() => [] as BonificacionPago[]),
    ]).then(([deducciones, bonificaciones]) => {
      const filasDeduccion = (deducciones ?? []).map(d =>
        `<div class="dato-fila">
          <span class="lbl">&nbsp;&nbsp;• ${d.nombre ?? 'Deducción'}</span>
          <span class="val" style="color:#b91c1c">− ${this.fmtMoneda(d.monto)}</span>
        </div>`).join('');

      const filasBonificacion = (bonificaciones ?? []).map(b =>
        `<div class="dato-fila">
          <span class="lbl">&nbsp;&nbsp;• ${b.nombre ?? 'Bonificación'}</span>
          <span class="val" style="color:#15803d">+ ${this.fmtMoneda(b.monto)}</span>
        </div>`).join('');

      const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
        <title>Comprobante — ${nombre}</title>
        <style>${this.pdfStyles}
          @media print { @page { margin: 12mm; size: A4 portrait; } }
        </style></head><body>
        <div class="pagina" style="max-width:560px">
          <div class="pdf-header">
            <div>
              <div class="pdf-empresa">Salary<span>Center</span></div>
              <div class="pdf-empresa-sub">Sistema de Gestión de Planillas</div>
            </div>
            <div class="pdf-doc-tipo">
              <div class="titulo">Comprobante de Pago</div>
              <div class="subtitulo">${new Date().toLocaleDateString('es-CR')}</div>
            </div>
          </div>
          <div class="pdf-meta">
            <div class="pdf-meta-item">Período<strong>${p.periodo}</strong></div>
            <div class="pdf-meta-item">Fecha de pago<strong>${this.fmtFecha(p.fechaPago)}</strong></div>
          </div>
          <div class="pdf-body">
            <div class="sec-title">Datos del empleado</div>
            <div class="dato-fila"><span class="lbl">Nombre completo</span><span class="val">${nombre}</span></div>
            <div class="dato-fila"><span class="lbl">Cédula</span><span class="val">${cedula}</span></div>
            <div class="dato-fila"><span class="lbl">Período</span><span class="val">${this.fmtFecha(p.fechaInicio)} — ${this.fmtFecha(p.fechaFin)}</span></div>
            <div class="sec-title">Detalle salarial</div>
            <div class="dato-fila"><span class="lbl">Salario base mensual</span><span class="val">${this.fmtMoneda(pago.salarioBase)}</span></div>
            <div class="dato-fila"><span class="lbl">Días trabajados</span><span class="val">${pago.diasTrabajados} de ${pago.diasEsperados}</span></div>
            <div class="dato-fila"><span class="lbl">Horas extra</span><span class="val">${pago.horasExtras}</span></div>
            <div class="dato-fila" style="font-weight:600"><span class="lbl">Total bruto</span><span class="val">${this.fmtMoneda(pago.totalBruto)}</span></div>
            <div class="sec-title">Deducciones</div>
            ${filasDeduccion || '<div class="dato-fila"><span class="lbl" style="color:#94a3b8">Sin deducciones registradas</span></div>'}
            <div class="dato-fila" style="font-weight:600;border-top:1px solid #e2e8f0;margin-top:4px;padding-top:6px">
              <span class="lbl">Total deducciones</span>
              <span class="val" style="color:#b91c1c">− ${this.fmtMoneda(pago.totalDeducciones)}</span>
            </div>
            <div class="sec-title">Bonificaciones</div>
            ${filasBonificacion || '<div class="dato-fila"><span class="lbl" style="color:#94a3b8">Sin bonificaciones registradas</span></div>'}
            <div class="dato-fila" style="font-weight:600;border-top:1px solid #e2e8f0;margin-top:4px;padding-top:6px">
              <span class="lbl">Total bonificaciones</span>
              <span class="val" style="color:#15803d">+ ${this.fmtMoneda(pago.totalBonificaciones)}</span>
            </div>
            <div class="dato-fila total-row" style="margin-top:16px">
              <span class="lbl">SALARIO NETO A PAGAR</span>
              <span class="val">${this.fmtMoneda(pago.salarioNeto)}</span>
            </div>
          </div>
          <div class="pdf-footer">SalaryCenter · ISW-811 · Este documento es un comprobante oficial de pago</div>
        </div>
        <script>window.onload = function(){ window.print(); }<\/script>
        </body></html>`;

      const w = window.open('', '_blank');
      if (w) { w.document.write(html); w.document.close(); }
    });
  }

  

  protected toggleEmp(id: number) {
    if (this.seleccionados.has(id)) this.seleccionados.delete(id);
    else this.seleccionados.add(id);
  }

  protected get todosSeleccionados(): boolean {
    return this.empleados().length > 0 && this.seleccionados.size === this.empleados().length;
  }

  protected toggleTodos() {
    if (this.todosSeleccionados) this.seleccionados.clear();
    else this.empleados().forEach(e => this.seleccionados.add(e.id));
  }

  protected calcularAsistencia() {
    this.paso.set(1);
    const ids = Array.from(this.seleccionados);
    const url = `http://localhost/ServicioPlanilla/Previsualizar?planillaId=${this.planillaId}&empleadosIds=${ids.join(',')}`;
    this.http.get<PrevResult>(url).subscribe({
      next: (data) => { this.previsualizacion.set(data); this.paso.set(2); },
      error: () => { this.notifSvc.mostrar('Error al calcular', 'error'); this.paso.set(0); },
    });
  }

  protected confirmarProcesar() {
    if (this.procesando) return;
    this.procesando = true;
    const ids = Array.from(this.seleccionados);
    this.http.post('http://localhost/ServicioPlanilla/GenerarPagos', { planillaId: this.planillaId, empleadosIds: ids }).subscribe({
      next: (res: any) => {
        this.paso.set(4);
        this.procesando = false;
        this.previsualizacion.set(null);
        this.loadAll();
        this.notifSvc.mostrar(`Planilla procesada — ${res.total} pagos generados`);
      },
      error: (e) => {
        this.procesando = false;
        this.paso.set(2);
        this.notifSvc.mostrar(e.error?.error ?? 'Error al procesar', 'error');
      },
    });
  }

  protected finalizarProcesamiento() { this.paso.set(0); this.tab = 'resumen'; }
  protected verDetalleEmp(emp: PrevEmp) { this.empDetalle = emp; }
  protected cerrarDetalle() { this.empDetalle = null; }


  // DEDUCCIONES


  protected abrirDeducciones(pago: Pago) {
    this.pagoSeleccionado = pago;
    this.mostrandoModalDeducciones = true;
    this.cargarDeduccionesPago(pago.id);
  }

  protected cargarDeduccionesPago(pagoId: number) {
    this.http.get<DeduccionPago[]>(this.apiDeducUrl + `ReadPorPago?pagoId=${pagoId}`).subscribe({
      next: (d) => this.deduccionesPago.set(d),
      error: () => this.notifSvc.mostrar('Error al cargar deducciones', 'error'),
    });
  }

  protected cerrarModalDeducciones() {
    this.mostrandoModalDeducciones    = false;
    this.mostrandoModalNuevaDeduccion = false;
    this.pagoSeleccionado = null;
    this.deduccionesPago.set([]);
  }

  protected abrirNuevaDeduccion() {
    this.formDeduccion = { tipoDeduccionId: 0, montoManual: 0, observaciones: '' };
    this.mostrandoModalNuevaDeduccion = true;
  }
  protected cerrarNuevaDeduccion() { this.mostrandoModalNuevaDeduccion = false; }

  protected onTipoDeduccionChange() {
    const tipo = this.tiposDeduccion().find(t => t.id === Number(this.formDeduccion.tipoDeduccionId));
    if (!tipo || !this.pagoSeleccionado) return;
    if (tipo.porcentaje !== null) {
      this.formDeduccion.montoManual = Math.round(this.pagoSeleccionado.totalBruto * (tipo.porcentaje / 100) * 100) / 100;
    } else if (tipo.montoFijo !== null) {
      this.formDeduccion.montoManual = tipo.montoFijo;
    }
  }

  protected guardarNuevaDeduccion() {
    if (!this.pagoSeleccionado) return;
    if (!this.formDeduccion.tipoDeduccionId) { this.notifSvc.mostrar('Seleccioná un tipo de deducción', 'error'); return; }
    if (!this.formDeduccion.montoManual || this.formDeduccion.montoManual <= 0) { this.notifSvc.mostrar('El monto debe ser mayor a 0', 'error'); return; }

    const payload = {
      pagoId:          this.pagoSeleccionado.id,
      tipoDeduccionId: Number(this.formDeduccion.tipoDeduccionId),
      monto:           this.formDeduccion.montoManual,
      observaciones:   this.formDeduccion.observaciones || 'Deducción especial agregada manualmente',
    };

    this.http.post(this.apiDeducUrl + 'Create', payload).subscribe({
      next: () => this.recalcularYRecargar(this.pagoSeleccionado!, 'deduccion', 'Deducción agregada correctamente'),
      error: () => this.notifSvc.mostrar('Error al guardar la deducción', 'error'),
    });
  }

 protected pedirConfirmarEliminarDeduccion(ded: DeduccionPago) {
    this.deduccionAEliminar = ded;
  }

  protected confirmarEliminarDeduccion() {
    const ded = this.deduccionAEliminar;
    if (!ded || !this.pagoSeleccionado) return;
    this.deduccionAEliminar = null;
    this.http.post(this.apiDeducUrl + 'Delete', { id: ded.id }).subscribe({
      next: () => this.recalcularYRecargar(this.pagoSeleccionado!, 'deduccion', 'Deducción eliminada'),
      error: () => this.notifSvc.mostrar('Error al eliminar la deducción', 'error'),
    });
  }

  protected cancelarEliminarDeduccion() {
    this.deduccionAEliminar = null;
  }



  // BONIFICACIONES
 

  protected abrirBonificaciones(pago: Pago) {
    this.pagoSeleccionadoBonif = pago;
    this.mostrandoModalBonificaciones = true;
    this.cargarBonificacionesPago(pago.id);
  }

  protected cargarBonificacionesPago(pagoId: number) {
    this.http.get<BonificacionPago[]>(this.apiBonifUrl + `ReadPorPago?pagoId=${pagoId}`).subscribe({
      next: (d) => this.bonificacionesPago.set(d),
      error: () => this.notifSvc.mostrar('Error al cargar bonificaciones', 'error'),
    });
  }

  protected cerrarModalBonificaciones() {
    this.mostrandoModalBonificaciones    = false;
    this.mostrandoModalNuevaBonificacion = false;
    this.pagoSeleccionadoBonif = null;
    this.bonificacionesPago.set([]);
  }

  protected abrirNuevaBonificacion() {
    this.formBonificacion = { tipoBonificacionId: 0, montoManual: 0, observaciones: '' };
    this.mostrandoModalNuevaBonificacion = true;
  }
  protected cerrarNuevaBonificacion() { this.mostrandoModalNuevaBonificacion = false; }

  protected guardarNuevaBonificacion() {
    if (!this.pagoSeleccionadoBonif) return;
    if (!this.formBonificacion.tipoBonificacionId) { this.notifSvc.mostrar('Seleccioná un tipo de bonificación', 'error'); return; }
    if (!this.formBonificacion.montoManual || this.formBonificacion.montoManual <= 0) { this.notifSvc.mostrar('El monto debe ser mayor a 0', 'error'); return; }

    const payload = {
      pagoId:             this.pagoSeleccionadoBonif.id,
      tipoBonificacionId: Number(this.formBonificacion.tipoBonificacionId),
      monto:              this.formBonificacion.montoManual,
      observaciones:      this.formBonificacion.observaciones || 'Bonificación especial agregada manualmente',
    };

    this.http.post(this.apiBonifUrl + 'Create', payload).subscribe({
      next: () => this.recalcularYRecargar(this.pagoSeleccionadoBonif!, 'bonificacion', 'Bonificación agregada correctamente'),
      error: () => this.notifSvc.mostrar('Error al guardar la bonificación', 'error'),
    });
  }

  protected pedirConfirmarEliminarBonificacion(bon: BonificacionPago) {
    this.bonificacionAEliminar = bon;
  }

  protected confirmarEliminarBonificacion() {
    const bon = this.bonificacionAEliminar;
    if (!bon || !this.pagoSeleccionadoBonif) return;
    this.bonificacionAEliminar = null;
    this.http.post(this.apiBonifUrl + 'Delete', { id: bon.id }).subscribe({
      next: () => this.recalcularYRecargar(this.pagoSeleccionadoBonif!, 'bonificacion', 'Bonificación eliminada'),
      error: () => this.notifSvc.mostrar('Error al eliminar la bonificación', 'error'),
    });
  }

  protected cancelarEliminarBonificacion() {
    this.bonificacionAEliminar = null;
  }

  // Recalcula el pago y recarga la lista — evita duplicar este bloque en cada acción
  private recalcularYRecargar(pago: Pago, tipo: 'deduccion' | 'bonificacion', mensaje: string) {
    this.http.post(this.apiPagoUrl + 'Recalcular', { pagoId: pago.id }).subscribe({
      next: (res: any) => {
        const actualizado = { ...pago, totalDeducciones: res.totalDeducciones, totalBonificaciones: res.totalBonificaciones, salarioNeto: res.salarioNeto };
        if (tipo === 'deduccion') {
          this.pagoSeleccionado = actualizado;
          this.cerrarNuevaDeduccion();
          this.cargarDeduccionesPago(pago.id);
        } else {
          this.pagoSeleccionadoBonif = actualizado;
          this.cerrarNuevaBonificacion();
          this.cargarBonificacionesPago(pago.id);
        }
        this.notifSvc.mostrar(mensaje);
        this.loadAll();
      },
      error: () => this.notifSvc.mostrar(`${mensaje} pero error al recalcular`, 'error'),
    });
  }



  protected get historialCompleto(): HistorialSalario[] {
    const registros = this.historial();
    const empConHistorial = new Set(registros.map(h => h.empleadoId));
    const sinHistorial: HistorialSalario[] = this.empleados()
      .filter(e => !empConHistorial.has(e.id))
      .map(e => ({
        id: 0,
        empleadoId: e.id,
        salarioAnterior: 0,
        salarioNuevo: e.salarioBase,
        fechaCambio: '',
        motivo: 'Salario base inicial',
        autorizadoPor: 0,
      }));
    return [...registros, ...sinHistorial];
  }

  protected get salarioMaximo(): number {
    const salarios = this.empleados().map(e => e.salarioBase);
    return salarios.length ? Math.max(...salarios) : 1;
  }

  protected baraPorcentaje(sal: number): number {
    return this.salarioMaximo > 0 ? (sal / this.salarioMaximo) * 100 : 0;
  }

  protected incremento(ant: number, nuevo: number): string {
    if (!ant) return '—';
    const pct = ((nuevo - ant) / ant) * 100;
    return (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%';
  }

  protected get usuariosAutorizadores(): Usuario[] {
    return this.usuarios().filter(u => u.rol === 'admin' || u.rol === 'gerente');
  }

  protected abrirFormSalario(emp?: Empleado) {
    this.formSalario = {
      empleadoId:      emp?.id ?? 0,
      salarioAnterior: emp?.salarioBase ?? 0,
      salarioNuevo: 0, motivo: '', autorizadoPor: 0,
    };
    this.mostrarFormSalario = true;
  }

  protected onEmpleadoSalarioChange() {
    const e = this.empleados().find(x => x.id === this.formSalario.empleadoId);
    if (e) this.formSalario.salarioAnterior = e.salarioBase;
  }

  protected get previewIncremento(): string {
    return this.incremento(this.formSalario.salarioAnterior, this.formSalario.salarioNuevo);
  }

  protected guardarSalario() {
    if (!this.formSalario.empleadoId || !this.formSalario.salarioNuevo) return;
    this.enviandoSalario = true;
    this.http.post('http://localhost/ServicioHistorialSalario/Create', this.formSalario).subscribe({
      next: () => {
        this.enviandoSalario    = false;
        this.mostrarFormSalario = false;
        this.loadAll();
        this.notifSvc.mostrar('Salario actualizado exitosamente');
      },
      error: () => { this.enviandoSalario = false; this.notifSvc.mostrar('Error al actualizar salario', 'error'); },
    });
  }

  protected nombreEmpHistorial(id: number): string {
    const e = this.empleados().find(x => x.id === id);
    return e ? `${e.nombre} ${e.apellido}` : `#${id}`;
  }
}