import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificacionService } from '../notificacion.service';

interface TipoBonificacion {
  id: number; codigo: string; nombre: string;
  descripcion: string; estado: string; creacion: string;
}

@Component({
  selector: 'app-crud-tipobonificacion',
  imports: [FormsModule],
  templateUrl: './crud-tipobonificacion.html',
  styleUrl: './crud-tipobonificacion.css',
})
export class CrudTipobonificacion implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly notifSvc = inject(NotificacionService);
  private readonly apiUrl = 'http://localhost/ServicioTipoBonificacion/';

  protected readonly lista = signal<TipoBonificacion[]>([]);
  protected mostrandoModal = false;
  protected modoEditar = false;
  protected enviado = false;
  protected form = this.formVacio();
  protected mostrandoConfirmacion = false;
  protected idAEliminar = 0;
  protected estadoActual = '';
  protected terminoBusqueda = '';
  protected codigoSufijo = '';

  ngOnInit() { this.loadTiposBonificaciones(); }

  protected loadTiposBonificaciones() {
    this.http.get<TipoBonificacion[]>(this.apiUrl + 'ReadAll').subscribe({
      next: (data) => this.lista.set(data),
      error: (err) => console.error('Error loading tipos de bonificacion', err),
    });
  }

  protected get listaFiltrada(): TipoBonificacion[] {
    const t = this.terminoBusqueda.toLowerCase().trim();
    if (!t) return this.lista();
    return this.lista().filter(tb =>
      tb.nombre?.toLowerCase().includes(t) ||
      tb.codigo?.toLowerCase().includes(t) ||
      String(tb.id).includes(t)
    );
  }

  protected formVacio() { return { codigo: '', nombre: '', descripcion: '', estado: 'activo' }; }
  protected formValido(): boolean { return this.codigoSufijo !== '' && this.form.nombre !== ''; }

  protected abrirCrear() {
    this.form = this.formVacio();
    this.codigoSufijo = '';
    this.enviado = false; this.modoEditar = false; this.mostrandoModal = true;
  }
  protected abrirEditar(item: TipoBonificacion) {
    this.form = { ...item };
    this.codigoSufijo = item.codigo.startsWith('BON-') ? item.codigo.slice(4) : item.codigo;
    this.enviado = false; this.modoEditar = true; this.mostrandoModal = true;
  }
  protected cerrarModal() { this.mostrandoModal = false; this.enviado = false; }

  protected confirmarEliminar(id: number, estado: string) { this.idAEliminar = id; this.estadoActual = estado; this.mostrandoConfirmacion = true; }
  protected cerrarConfirmacion() { this.mostrandoConfirmacion = false; this.idAEliminar = 0; this.estadoActual = ''; }
  protected ejecutarEliminar() {
    const msg = this.estadoActual === 'activo' ? 'Tipo de bonificación desactivado exitosamente' : 'Tipo de bonificación activado exitosamente';
    this.http.post(this.apiUrl + 'Delete', { id: this.idAEliminar }).subscribe({
      next: () => { this.loadTiposBonificaciones(); this.cerrarConfirmacion(); this.notifSvc.mostrar(msg); },
      error: () => { this.cerrarConfirmacion(); this.notifSvc.mostrar('Error al cambiar estado del tipo de bonificación', 'error'); },
    });
  }

  protected guardar() {
    this.enviado = true;
    if (!this.formValido()) return;
    this.form.codigo = 'BON-' + this.codigoSufijo;
    if (this.modoEditar) {
      this.http.post(this.apiUrl + 'Update', this.form).subscribe({
        next: () => { this.loadTiposBonificaciones(); this.cerrarModal(); this.notifSvc.mostrar('Tipo de bonificación actualizado exitosamente'); },
        error: () => this.notifSvc.mostrar('Error al actualizar el tipo de bonificación', 'error'),
      });
    } else {
      this.http.post(this.apiUrl + 'Create', this.form).subscribe({
        next: () => { this.loadTiposBonificaciones(); this.cerrarModal(); this.notifSvc.mostrar('Tipo de bonificación creado exitosamente'); },
        error: () => this.notifSvc.mostrar('Error al crear el tipo de bonificación', 'error'),
      });
    }
  }
  cerrar() { this.router.navigate(["/"]); }
}
