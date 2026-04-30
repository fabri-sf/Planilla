import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificacionService } from '../notificacion.service';

interface TipoDeduccion {
  id: number; codigo: string; nombre: string; porcentaje: number;
  montoFijo: number; obligatorio: boolean; estado: string; creacion: string;
}

@Component({
  selector: 'app-crud-tipodeduccion',
  imports: [FormsModule],
  templateUrl: './crud-tipodeduccion.html',
  styleUrl: './crud-tipodeduccion.css',
})
export class CrudTipodeduccion implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly notifSvc = inject(NotificacionService);
  private readonly apiUrl = 'http://localhost/ServicioTipoDeduccion/';

  protected readonly lista = signal<TipoDeduccion[]>([]);
  protected mostrandoModal = false;
  protected modoEditar = false;
  protected enviado = false;
  protected form = this.formVacio();
  protected mostrandoConfirmacion = false;
  protected idAEliminar = 0;
  protected estadoActual = '';
  protected terminoBusqueda = '';
  protected codigoSufijo = '';

  ngOnInit() { this.loadTiposDeducciones(); }

  protected loadTiposDeducciones() {
    this.http.get<TipoDeduccion[]>(this.apiUrl + 'ReadAll').subscribe({
      next: (data) => this.lista.set(data),
      error: (err) => console.error('Error loading tipos de deduccion', err),
    });
  }

  protected get listaFiltrada(): TipoDeduccion[] {
    const t = this.terminoBusqueda.toLowerCase().trim();
    if (!t) return this.lista();
    return this.lista().filter(td =>
      td.nombre?.toLowerCase().includes(t) ||
      td.codigo?.toLowerCase().includes(t) ||
      String(td.id).includes(t)
    );
  }

  protected formVacio() { return { codigo: '', nombre: '', porcentaje: 0, montoFijo: 0, obligatorio: false, estado: 'activo' }; }
  protected formValido(): boolean { return this.codigoSufijo !== '' && this.form.nombre !== ''; }

  protected abrirCrear() {
    this.form = this.formVacio();
    this.codigoSufijo = '';
    this.enviado = false; this.modoEditar = false; this.mostrandoModal = true;
  }
  protected abrirEditar(item: TipoDeduccion) {
    this.form = { ...item };
    this.codigoSufijo = item.codigo.startsWith('DED-') ? item.codigo.slice(4) : item.codigo;
    this.enviado = false; this.modoEditar = true; this.mostrandoModal = true;
  }
  protected cerrarModal() { this.mostrandoModal = false; this.enviado = false; }

  protected confirmarEliminar(id: number, estado: string) { this.idAEliminar = id; this.estadoActual = estado; this.mostrandoConfirmacion = true; }
  protected cerrarConfirmacion() { this.mostrandoConfirmacion = false; this.idAEliminar = 0; this.estadoActual = ''; }
  protected ejecutarEliminar() {
    const msg = this.estadoActual === 'activo' ? 'Tipo de deducción desactivado exitosamente' : 'Tipo de deducción activado exitosamente';
    this.http.post(this.apiUrl + 'Delete', { id: this.idAEliminar }).subscribe({
      next: () => { this.loadTiposDeducciones(); this.cerrarConfirmacion(); this.notifSvc.mostrar(msg); },
      error: () => { this.cerrarConfirmacion(); this.notifSvc.mostrar('Error al cambiar estado del tipo de deducción', 'error'); },
    });
  }

  protected guardar() {
    this.enviado = true;
    if (!this.formValido()) return;
    this.form.codigo = 'DED-' + this.codigoSufijo;
    if (this.modoEditar) {
      this.http.post(this.apiUrl + 'Update', this.form).subscribe({
        next: () => { this.loadTiposDeducciones(); this.cerrarModal(); this.notifSvc.mostrar('Tipo de deducción actualizado exitosamente'); },
        error: () => this.notifSvc.mostrar('Error al actualizar el tipo de deducción', 'error'),
      });
    } else {
      this.http.post(this.apiUrl + 'Create', this.form).subscribe({
        next: () => { this.loadTiposDeducciones(); this.cerrarModal(); this.notifSvc.mostrar('Tipo de deducción creado exitosamente'); },
        error: () => this.notifSvc.mostrar('Error al crear el tipo de deducción', 'error'),
      });
    }
  }
  cerrar() { this.router.navigate(["/"]); }
}
