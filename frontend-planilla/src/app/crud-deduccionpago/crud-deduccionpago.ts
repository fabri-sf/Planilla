import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificacionService } from '../notificacion.service';

interface DeduccionPago {
  id: number; pagoId: number; tipoDeduccionId: number; monto: number; observaciones: string;
}
interface Pago { id: number; empleadoId: number; planillaId: number; }
interface Empleado { id: number; nombre: string; apellido: string; }
interface TipoDeduccion { id: number; nombre: string; }

@Component({
  selector: 'app-crud-deduccionpago',
  imports: [FormsModule],
  templateUrl: './crud-deduccionpago.html',
  styleUrl: './crud-deduccionpago.css',
})
export class CrudDeduccionpago implements OnInit {
  private readonly http     = inject(HttpClient);
  private readonly router   = inject(Router);
  private readonly notifSvc = inject(NotificacionService);
  private readonly apiUrl   = 'http://localhost/ServicioDeduccionPago/';

  protected readonly lista            = signal<DeduccionPago[]>([]);
  protected readonly pagos            = signal<Pago[]>([]);
  protected readonly empleados        = signal<Empleado[]>([]);
  protected readonly tiposDeducciones = signal<TipoDeduccion[]>([]);

  protected mostrandoConfirmacion = false;
  protected idAEliminar           = 0;
  protected terminoBusqueda       = '';

  ngOnInit() {
    this.loadDeducciones();
    this.http.get<Pago[]>('http://localhost/ServicioPago/ReadAll').subscribe({ next: (d) => this.pagos.set(d), error: () => {} });
    this.http.get<Empleado[]>('http://localhost/ServicioEmpleado/ReadAll').subscribe({ next: (d) => this.empleados.set(d), error: () => {} });
    this.http.get<TipoDeduccion[]>('http://localhost/ServicioTipoDeduccion/ReadAll').subscribe({ next: (d) => this.tiposDeducciones.set(d), error: () => {} });
  }

  protected loadDeducciones() {
    this.http.get<DeduccionPago[]>(this.apiUrl + 'ReadAll').subscribe({
      next: (data) => this.lista.set(data),
      error: (err) => console.error('Error loading deducciones', err),
    });
  }

  protected get listaFiltrada(): DeduccionPago[] {
    const t = this.terminoBusqueda.toLowerCase().trim();
    if (!t) return this.lista();
    return this.lista().filter(d =>
      this.nombrePago(d.pagoId).toLowerCase().includes(t) ||
      this.nombreTipoDeduccion(d.tipoDeduccionId).toLowerCase().includes(t) ||
      String(d.id).includes(t)
    );
  }

  protected nombrePago(id: number): string {
    const pago = this.pagos().find(p => p.id === id);
    if (!pago) return `Pago #${id}`;
    const emp = this.empleados().find(e => e.id === pago.empleadoId);
    return emp ? `${emp.nombre} ${emp.apellido} — pago #${id}` : `Pago #${id}`;
  }

  protected nombreTipoDeduccion(id: number): string {
    return this.tiposDeducciones().find(t => t.id === id)?.nombre ?? String(id);
  }

  protected confirmarEliminar(id: number) { this.idAEliminar = id; this.mostrandoConfirmacion = true; }
  protected cerrarConfirmacion()          { this.mostrandoConfirmacion = false; this.idAEliminar = 0; }

  protected ejecutarEliminar() {
    this.http.post(this.apiUrl + 'Delete', { id: this.idAEliminar }).subscribe({
      next: () => { this.loadDeducciones(); this.cerrarConfirmacion(); this.notifSvc.mostrar('Deducción eliminada exitosamente'); },
      error: () => { this.cerrarConfirmacion(); this.notifSvc.mostrar('Error al eliminar la deducción', 'error'); },
    });
  }

  cerrar() { this.router.navigate(['/']); }
}