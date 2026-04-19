import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe, NgStyle } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificacionService } from '../notificacion.service';

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
  cargasCCSS: number; bancoPOpular: number;
}
interface PrevResult { planilla: Planilla; empleados: PrevEmp[]; totales: any; }

type Tab = 'resumen' | 'procesar' | 'historial';

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

  protected planillaId = 0;
  protected readonly planilla  = signal<Planilla | null>(null);
  protected readonly pagos     = signal<Pago[]>([]);
  protected readonly usuarios  = signal<Usuario[]>([]);
  protected readonly empleados = signal<Empleado[]>([]);
  protected readonly historial = signal<HistorialSalario[]>([]);

  // Tabs
  protected tab: Tab = 'resumen';

  // Confirmación eliminar
  protected confirmarEliminar = false;

  // ── Stepper de procesamiento ──────────────────────────────────────────
  protected paso = 0; // 0=elegir empleados, 1=calculando, 2=resultados, 3=confirmar
  protected seleccionados = new Set<number>();
  protected previsualizacion = signal<PrevResult | null>(null);
  protected procesando = false;
  protected empDetalle: PrevEmp | null = null; // modal detalle por empleado

  // ── Historial salarios ────────────────────────────────────────────────
  protected mostrarFormSalario = false;
  protected formSalario = { empleadoId: 0, salarioAnterior: 0, salarioNuevo: 0, motivo: '', autorizadoPor: 0 };
  protected enviandoSalario = false;

  ngOnInit() {
    this.planillaId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAll();
  }

  private loadAll() {
    this.http.get<Planilla[]>('http://localhost/ServicioPlanilla/ReadAll').subscribe({
      next: (list) => {
        const p = list.find(x => x.id === this.planillaId);
        if (p) this.planilla.set(p);
      }, error: () => {}
    });
    this.http.get<Pago[]>('http://localhost/ServicioPago/ReadAll').subscribe({
      next: (d) => this.pagos.set(d.filter(p => p.planillaId === this.planillaId)), error: () => {}
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
  }

  // ── Helpers de presentación ───────────────────────────────────────────
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

  // ── Totales de pagos ──────────────────────────────────────────────────
  protected get totalBruto(): number       { return this.pagos().reduce((s, p) => s + parseFloat(String(p.totalBruto)) || 0, 0); }
  protected get totalDeducciones(): number { return this.pagos().reduce((s, p) => s + parseFloat(String(p.totalDeducciones)) || 0, 0); }
  protected get totalNeto(): number        { return this.pagos().reduce((s, p) => s + parseFloat(String(p.salarioNeto)) || 0, 0); }

  // ── Timeline de estados ───────────────────────────────────────────────
  protected readonly ESTADOS_TIMELINE = ['borrador','procesada','aprobada','pagada','cerrada'];
  protected estadoIndex(est: string): number { return this.ESTADOS_TIMELINE.indexOf(est); }
  protected estadoActualIndex(): number {
    const p = this.planilla(); if (!p) return 0;
    return this.estadoIndex(p.estado === 'atrasada' ? 'procesada' : p.estado);
  }

  // ── Badges ────────────────────────────────────────────────────────────
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

  // ── Acciones de estado ────────────────────────────────────────────────
  protected cambiarEstado() {
    const p = this.planilla(); if (!p) return;
    this.http.post('http://localhost/ServicioPlanilla/CambiarEstado', { planillaId: p.id }).subscribe({
      next: (res: any) => {
        this.loadAll();
        this.notifSvc.mostrar(`Planilla avanzada a "${res.estadoNuevo}"`);
      },
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

  // ── Export ────────────────────────────────────────────────────────────
  protected exportarCSV() {
    const cabecera = ['Empleado', 'Días', 'Hrs Extra', 'Bruto', 'Deducciones', 'Neto'];
    const filas = this.pagos().map(p => [
      this.nombreEmpleado(p.empleadoId),
      p.diasTrabajados, p.horasExtras,
      p.totalBruto, p.totalDeducciones, p.salarioNeto
    ]);
    const csv = [cabecera, ...filas].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `planilla-${this.planillaId}.csv`;
    a.click();
  }

  protected imprimirPDF() { window.print(); }

  // ── Stepper ───────────────────────────────────────────────────────────
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
    this.paso = 1;
    const ids = Array.from(this.seleccionados);
    const url = `http://localhost/ServicioPlanilla/Previsualizar?planillaId=${this.planillaId}&empleadosIds=${ids.join(',')}`;
    this.http.get<PrevResult>(url).subscribe({
      next: (data) => { this.previsualizacion.set(data); this.paso = 2; },
      error: () => { this.notifSvc.mostrar('Error al calcular', 'error'); this.paso = 0; },
    });
  }

  protected confirmarProcesar() {
    if (this.procesando) return;
    this.procesando = true;
    const ids = Array.from(this.seleccionados);
    this.http.post('http://localhost/ServicioPlanilla/GenerarPagos', { planillaId: this.planillaId, empleadosIds: ids }).subscribe({
      next: (res: any) => {
        this.procesando = false;
        this.paso = 0;
        this.previsualizacion.set(null);
        this.tab = 'resumen';
        this.loadAll();
        this.notifSvc.mostrar(`Planilla procesada — ${res.total} pagos generados`);
      },
      error: (e) => {
        this.procesando = false;
        this.paso = 2;
        this.notifSvc.mostrar(e.error?.error ?? 'Error al procesar', 'error');
      },
    });
  }

  protected verDetalleEmp(emp: PrevEmp) { this.empDetalle = emp; }
  protected cerrarDetalle() { this.empDetalle = null; }

  // ── Historial salarios ────────────────────────────────────────────────
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
      empleadoId: emp?.id ?? 0,
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
        this.enviandoSalario = false;
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
