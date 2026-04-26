import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificacionService } from '../notificacion.service';

interface Pago {
  id: number; empleadoId: number; planillaId: number; salarioBase: number;
  diasTrabajados: number; diasEsperados: number; horasExtras: number;
  totalBruto: number; totalDeducciones: number; totalBonificaciones: number;
  salarioNeto: number; observaciones: string; fecha: string;
  nombre?: string; apellido?: string; cedula?: string;
}

interface Empleado { id: number; nombre: string; apellido: string; salarioBase: number; }
interface Planilla  { id: number; periodo: string; estado: string; }

interface TipoDeduccion {
  id: number; codigo: string; nombre: string;
  porcentaje: number | null; montoFijo: number | null; obligatorio: boolean;
}

interface DeduccionPago {
  id: number; pagoId: number; tipoDeduccionId: number;
  monto: number; observaciones: string;
  nombre?: string; codigo?: string;
}

@Component({
  selector: 'app-crud-pago',
  imports: [FormsModule],
  templateUrl: './crud-pago.html',
  styleUrl: './crud-pago.css',
})
export class CrudPago implements OnInit {
  private readonly http        = inject(HttpClient);
  private readonly router      = inject(Router);
  private readonly notifSvc    = inject(NotificacionService);
  private readonly apiUrl      = 'http://localhost/ServicioPago/';
  private readonly apiDeducUrl = 'http://localhost/ServicioDeduccionPago/';
  private readonly apiTipoUrl  = 'http://localhost/ServicioTipoDeduccion/';

  protected readonly lista          = signal<Pago[]>([]);
  protected readonly empleados      = signal<Empleado[]>([]);
  protected readonly planillas      = signal<Planilla[]>([]);
  protected readonly tiposDeduccion = signal<TipoDeduccion[]>([]);

  protected planillaSeleccionada = 0;
  protected terminoBusqueda      = '';

  // ── Modal observaciones ──────────────────────────────────────────────────
  protected mostrandoModal = false;
  protected formObs = { id: 0, observaciones: '' };

  // ── Modal deducciones (solo lectura) ─────────────────────────────────────
  protected mostrandoModalDeducciones = false;
  protected pagoSeleccionado: Pago | null = null;
  protected deduccionesPago = signal<DeduccionPago[]>([]);

  ngOnInit() {
    this.loadPagos();
    this.http.get<Empleado[]>('http://localhost/ServicioEmpleado/ReadAll').subscribe({
      next: (d) => this.empleados.set(d), error: () => {}
    });
    this.http.get<Planilla[]>('http://localhost/ServicioPlanilla/ReadAll').subscribe({
      next: (d) => this.planillas.set(d), error: () => {}
    });
    this.http.get<TipoDeduccion[]>(this.apiTipoUrl + 'ReadAll').subscribe({
      next: (d) => this.tiposDeduccion.set(d), error: () => {}
    });
  }

  protected loadPagos() {
    this.http.get<Pago[]>(this.apiUrl + 'ReadAll').subscribe({
      next: (data) => this.lista.set(data),
      error: (err)  => console.error('Error loading pagos', err),
    });
  }

  protected get listaFiltrada(): Pago[] {
    let result = this.lista();
    if (this.planillaSeleccionada > 0)
      result = result.filter(p => p.planillaId === this.planillaSeleccionada);
    const t = this.terminoBusqueda.toLowerCase().trim();
    if (!t) return result;
    return result.filter(p =>
      this.nombreEmpleado(p.empleadoId).toLowerCase().includes(t) ||
      this.nombrePlanilla(p.planillaId).toLowerCase().includes(t) ||
      String(p.id).includes(t)
    );
  }

  protected nombreEmpleado(id: number): string {
    const e = this.empleados().find(e => e.id === id);
    return e ? `${e.nombre} ${e.apellido}` : String(id);
  }

  protected nombrePlanilla(id: number): string {
    return this.planillas().find(p => p.id === id)?.periodo ?? String(id);
  }

  protected fmt(val: number): string {
    return val != null
      ? Number(val).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '0.00';
  }

  // ── Observaciones ────────────────────────────────────────────────────────
  protected abrirEditarObs(item: Pago) {
    this.formObs = { id: item.id, observaciones: item.observaciones ?? '' };
    this.mostrandoModal = true;
  }
  protected cerrarModal() { this.mostrandoModal = false; }

  protected guardarObs() {
    this.http.post(this.apiUrl + 'Update', this.formObs).subscribe({
      next: () => {
        this.loadPagos(); this.cerrarModal();
        this.notifSvc.mostrar('Observaciones actualizadas');
      },
      error: () => this.notifSvc.mostrar('Error al actualizar las observaciones', 'error'),
    });
  }

  // ── Deducciones (solo lectura) ───────────────────────────────────────────
  protected abrirDeducciones(item: Pago) {
    this.pagoSeleccionado = item;
    this.mostrandoModalDeducciones = true;
    this.cargarDeduccionesPago(item.id);
  }

  protected cargarDeduccionesPago(pagoId: number) {
    this.http.get<DeduccionPago[]>(this.apiDeducUrl + `ReadPorPago?pagoId=${pagoId}`).subscribe({
      next: (d) => this.deduccionesPago.set(d),
      error: () => this.notifSvc.mostrar('Error al cargar deducciones', 'error'),
    });
  }

  protected cerrarModalDeducciones() {
    this.mostrandoModalDeducciones = false;
    this.pagoSeleccionado = null;
    this.deduccionesPago.set([]);
  }

  cerrar() { this.router.navigate(['/']); }
}