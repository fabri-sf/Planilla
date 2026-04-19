import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificacionService } from '../notificacion.service';

interface Planilla {
  id: number; periodo: string; fechaInicio: string; fechaFin: string;
  fechaPago: string; estado: string; descripcion: string;
  creadoPor: number; aprobadoPor: number; creacion: string;
}

interface Usuario { id: number; nombreUsuario: string; rol: string; }

@Component({
  selector: 'app-crud-planilla',
  imports: [FormsModule],
  templateUrl: './crud-planilla.html',
  styleUrl: './crud-planilla.css',
})
export class CrudPlanilla implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly notifSvc = inject(NotificacionService);
  private readonly apiUrl = 'http://localhost/ServicioPlanilla/';

  protected readonly lista = signal<Planilla[]>([]);
  protected readonly usuarios = signal<Usuario[]>([]);
  protected mostrandoModal = false;
  protected modoEditar = false;
  protected enviado = false;
  protected form = this.formVacio();
  protected terminoBusqueda = '';
  protected procesando = false;

  // Para confirmación de acción de estado
  protected mostrandoConfirmEstado = false;
  protected planillaAccion: Planilla | null = null;
  protected esGenerarPagos = false;

  ngOnInit() {
    this.loadPlanillas();
    this.http.get<Usuario[]>('http://localhost/ServicioUsuario/ReadAll').subscribe({
      next: (d) => this.usuarios.set(d), error: () => {}
    });
  }

  protected loadPlanillas() {
    this.http.get<Planilla[]>(this.apiUrl + 'ReadAll').subscribe({
      next: (data) => this.lista.set(data),
      error: (err) => console.error('Error loading planillas', err),
    });
  }

  protected get listaFiltrada(): Planilla[] {
    const t = this.terminoBusqueda.toLowerCase().trim();
    if (!t) return this.lista();
    return this.lista().filter(p =>
      p.periodo?.toLowerCase().includes(t) ||
      p.estado?.toLowerCase().includes(t) ||
      String(p.id).includes(t)
    );
  }

  protected get usuariosAutorizados(): Usuario[] {
    return this.usuarios().filter(u => u.rol === 'admin' || u.rol === 'gerente');
  }

  protected nombreUsuario(id: number): string {
    return this.usuarios().find(u => u.id === id)?.nombreUsuario ?? (id > 0 ? `Usuario #${id}` : '—');
  }

  private formatDate(val: string): string { return val ? val.split('T')[0] : ''; }

  protected formVacio() {
    return { id: 0, periodo: '', fechaInicio: '', fechaFin: '', fechaPago: '',
             estado: 'borrador', descripcion: '', creadoPor: 0, aprobadoPor: 0 };
  }

  protected formValido(): boolean {
    return this.form.periodo !== '' && this.form.fechaInicio !== '' &&
           this.form.fechaFin !== '' && this.form.fechaPago !== '';
  }

  protected abrirCrear() {
    this.form = this.formVacio(); this.enviado = false; this.modoEditar = false; this.mostrandoModal = true;
  }
  protected abrirEditar(item: Planilla) {
    this.form = {
      ...item,
      fechaInicio: this.formatDate(item.fechaInicio),
      fechaFin: this.formatDate(item.fechaFin),
      fechaPago: this.formatDate(item.fechaPago),
    };
    this.enviado = false; this.modoEditar = true; this.mostrandoModal = true;
  }
  protected cerrarModal() { this.mostrandoModal = false; this.enviado = false; }

  protected guardar() {
    this.enviado = true;
    if (!this.formValido()) return;
    if (this.modoEditar) {
      this.http.post(this.apiUrl + 'Update', this.form).subscribe({
        next: () => { this.loadPlanillas(); this.cerrarModal(); this.notifSvc.mostrar('Planilla actualizada exitosamente'); },
        error: () => this.notifSvc.mostrar('Error al actualizar la planilla', 'error'),
      });
    } else {
      this.http.post(this.apiUrl + 'Create', this.form).subscribe({
        next: () => { this.loadPlanillas(); this.cerrarModal(); this.notifSvc.mostrar('Planilla creada exitosamente'); },
        error: () => this.notifSvc.mostrar('Error al crear la planilla', 'error'),
      });
    }
  }

  // ── Acciones de estado ────────────────────────────────────────────────────

  /** Etiqueta del botón de acción según el estado actual */
  protected etiquetaAccion(estado: string): string {
    const mapa: Record<string, string> = {
      borrador:  '⚙️ Procesar planilla',
      procesada: '✅ Aprobar',
      aprobada:  '💳 Marcar como pagada',
      pagada:    '🔒 Cerrar planilla',
    };
    return mapa[estado] ?? '';
  }

  protected confirmarAccionEstado(item: Planilla) {
    this.planillaAccion = item;
    this.esGenerarPagos = item.estado === 'borrador';
    this.mostrandoConfirmEstado = true;
  }

  protected cerrarConfirmEstado() {
    this.mostrandoConfirmEstado = false;
    this.planillaAccion = null;
  }

  protected ejecutarAccionEstado() {
    if (!this.planillaAccion || this.procesando) return;
    this.procesando = true;

    if (this.esGenerarPagos) {
      // borrador → procesada: genera pagos automáticos
      this.http.post(this.apiUrl + 'GenerarPagos', { planillaId: this.planillaAccion.id }).subscribe({
        next: (res: any) => {
          this.loadPlanillas();
          this.cerrarConfirmEstado();
          this.procesando = false;
          this.notifSvc.mostrar(`Planilla procesada. ${res.total} pago(s) generados automáticamente.`);
        },
        error: (err) => {
          this.procesando = false;
          this.cerrarConfirmEstado();
          this.notifSvc.mostrar(err.error?.error ?? 'Error al procesar la planilla', 'error');
        },
      });
    } else {
      // procesada → aprobada → pagada → cerrada
      this.http.post(this.apiUrl + 'CambiarEstado', { planillaId: this.planillaAccion.id }).subscribe({
        next: (res: any) => {
          this.loadPlanillas();
          this.cerrarConfirmEstado();
          this.procesando = false;
          this.notifSvc.mostrar(`Planilla avanzada a estado "${res.estadoNuevo}" exitosamente.`);
        },
        error: (err) => {
          this.procesando = false;
          this.cerrarConfirmEstado();
          this.notifSvc.mostrar(err.error?.error ?? 'Error al cambiar estado', 'error');
        },
      });
    }
  }

  /** Texto del confirm modal según la acción */
  protected textoConfirmAccion(): string {
    if (!this.planillaAccion) return '';
    if (this.esGenerarPagos) {
      return `Se calcularán y generarán los pagos automáticamente para todos los empleados activos. ¿Desea continuar?`;
    }
    const siguiente: Record<string, string> = {
      procesada: 'aprobada', aprobada: 'pagada', pagada: 'cerrada',
    };
    return `La planilla "${this.planillaAccion.periodo}" pasará de "${this.planillaAccion.estado}" a "${siguiente[this.planillaAccion.estado]}". ¿Desea continuar?`;
  }
  cerrar() { this.router.navigate(["/"]); }
}
