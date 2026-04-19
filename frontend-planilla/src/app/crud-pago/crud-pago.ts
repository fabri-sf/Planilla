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
  // campos enriquecidos desde el servidor (ReadByPlanilla)
  nombre?: string; apellido?: string; cedula?: string;
}

interface Empleado { id: number; nombre: string; apellido: string; }
interface Planilla { id: number; periodo: string; estado: string; }

@Component({
  selector: 'app-crud-pago',
  imports: [FormsModule],
  templateUrl: './crud-pago.html',
  styleUrl: './crud-pago.css',
})
export class CrudPago implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly notifSvc = inject(NotificacionService);
  private readonly apiUrl = 'http://localhost/ServicioPago/';

  protected readonly lista = signal<Pago[]>([]);
  protected readonly empleados = signal<Empleado[]>([]);
  protected readonly planillas = signal<Planilla[]>([]);
  protected planillaSeleccionada = 0;
  protected terminoBusqueda = '';

  // Modal solo para editar observaciones
  protected mostrandoModal = false;
  protected formObs = { id: 0, observaciones: '' };

  ngOnInit() {
    this.loadPagos();
    this.http.get<Empleado[]>('http://localhost/ServicioEmpleado/ReadAll').subscribe({
      next: (d) => this.empleados.set(d), error: () => {}
    });
    this.http.get<Planilla[]>('http://localhost/ServicioPlanilla/ReadAll').subscribe({
      next: (d) => this.planillas.set(d), error: () => {}
    });
  }

  protected loadPagos() {
    this.http.get<Pago[]>(this.apiUrl + 'ReadAll').subscribe({
      next: (data) => this.lista.set(data),
      error: (err) => console.error('Error loading pagos', err),
    });
  }

  protected get listaFiltrada(): Pago[] {
    let result = this.lista();
    if (this.planillaSeleccionada > 0) {
      result = result.filter(p => p.planillaId === this.planillaSeleccionada);
    }
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
    return val != null ? Number(val).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
  }

  protected abrirEditarObs(item: Pago) {
    this.formObs = { id: item.id, observaciones: item.observaciones ?? '' };
    this.mostrandoModal = true;
  }
  protected cerrarModal() { this.mostrandoModal = false; }

  protected guardarObs() {
    this.http.post(this.apiUrl + 'Update', this.formObs).subscribe({
      next: () => { this.loadPagos(); this.cerrarModal(); this.notifSvc.mostrar('Observaciones actualizadas'); },
      error: () => this.notifSvc.mostrar('Error al actualizar las observaciones', 'error'),
    });
  }
  cerrar() { this.router.navigate(["/"]); }
}
