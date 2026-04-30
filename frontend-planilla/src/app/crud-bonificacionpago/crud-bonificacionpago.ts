import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificacionService } from '../notificacion.service';

interface BonificacionPago {
  id: number; pagoId: number; tipoBonificacionId: number; monto: number; observaciones: string;
}
interface Pago { id: number; empleadoId: number; planillaId: number; }
interface Empleado { id: number; nombre: string; apellido: string; }
interface TipoBonificacion { id: number; nombre: string; }

@Component({
  selector: 'app-crud-bonificacionpago',
  imports: [FormsModule],
  templateUrl: './crud-bonificacionpago.html',
  styleUrl: './crud-bonificacionpago.css',
})
export class CrudBonificacionpago implements OnInit {
  private readonly http     = inject(HttpClient);
  private readonly router   = inject(Router);
  private readonly notifSvc = inject(NotificacionService);
  private readonly apiUrl   = 'http://localhost/ServicioBonificacionPago/';

  protected readonly lista             = signal<BonificacionPago[]>([]);
  protected readonly pagos             = signal<Pago[]>([]);
  protected readonly empleados         = signal<Empleado[]>([]);
  protected readonly tiposBonificacion = signal<TipoBonificacion[]>([]);

  protected mostrandoConfirmacion = false;
  protected idAEliminar           = 0;
  protected terminoBusqueda       = '';

  ngOnInit() {
    this.loadBonificaciones();
    this.http.get<Pago[]>('http://localhost/ServicioPago/ReadAll').subscribe({ next: (d) => this.pagos.set(d), error: () => {} });
    this.http.get<Empleado[]>('http://localhost/ServicioEmpleado/ReadAll').subscribe({ next: (d) => this.empleados.set(d), error: () => {} });
    this.http.get<TipoBonificacion[]>('http://localhost/ServicioTipoBonificacion/ReadAll').subscribe({ next: (d) => this.tiposBonificacion.set(d), error: () => {} });
  }

  protected loadBonificaciones() {
    this.http.get<BonificacionPago[]>(this.apiUrl + 'ReadAll').subscribe({
      next: (data) => this.lista.set(data),
      error: (err) => console.error('Error loading bonificaciones', err),
    });
  }

  protected get listaFiltrada(): BonificacionPago[] {
    const t = this.terminoBusqueda.toLowerCase().trim();
    if (!t) return this.lista();
    return this.lista().filter(b =>
      this.nombrePago(b.pagoId).toLowerCase().includes(t) ||
      this.nombreTipoBonificacion(b.tipoBonificacionId).toLowerCase().includes(t) ||
      String(b.id).includes(t)
    );
  }

  protected nombrePago(id: number): string {
    const pago = this.pagos().find(p => p.id === id);
    if (!pago) return `Pago #${id}`;
    const emp = this.empleados().find(e => e.id === pago.empleadoId);
    return emp ? `${emp.nombre} ${emp.apellido} — pago #${id}` : `Pago #${id}`;
  }

  protected nombreTipoBonificacion(id: number): string {
    return this.tiposBonificacion().find(t => t.id === id)?.nombre ?? String(id);
  }

  protected confirmarEliminar(id: number) { this.idAEliminar = id; this.mostrandoConfirmacion = true; }
  protected cerrarConfirmacion()          { this.mostrandoConfirmacion = false; this.idAEliminar = 0; }

  protected ejecutarEliminar() {
    this.http.post(this.apiUrl + 'Delete', { id: this.idAEliminar }).subscribe({
      next: () => { this.loadBonificaciones(); this.cerrarConfirmacion(); this.notifSvc.mostrar('Bonificación eliminada exitosamente'); },
      error: () => { this.cerrarConfirmacion(); this.notifSvc.mostrar('Error al eliminar la bonificación', 'error'); },
    });
  }

  cerrar() { this.router.navigate(['/']); }
}