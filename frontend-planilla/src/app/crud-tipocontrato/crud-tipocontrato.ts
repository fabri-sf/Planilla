import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificacionService } from '../notificacion.service';

interface TipoContrato {
  id: number; nombre: string; horasSemanales: number;
  descripcion: string; estado: string; creacion: string;
}

@Component({
  selector: 'app-crud-tipocontrato',
  imports: [FormsModule],
  templateUrl: './crud-tipocontrato.html',
  styleUrl: './crud-tipocontrato.css',
})
export class CrudTipocontrato implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly notifSvc = inject(NotificacionService);
  private readonly apiUrl = 'http://localhost/ServicioTipoContrato/';

  protected readonly lista = signal<TipoContrato[]>([]);
  protected mostrandoModal = false;
  protected modoEditar = false;
  protected enviado = false;
  protected form = this.formVacio();
  protected mostrandoConfirmacion = false;
  protected idAEliminar = 0;
  protected estadoActual = '';
  protected terminoBusqueda = '';

  ngOnInit() { this.loadTiposContrato(); }

  protected loadTiposContrato() {
    this.http.get<TipoContrato[]>(this.apiUrl + 'ReadAll').subscribe({
      next: (data) => this.lista.set(data),
      error: (err) => console.error('Error loading tipos de contrato', err),
    });
  }

  protected get listaFiltrada(): TipoContrato[] {
    const t = this.terminoBusqueda.toLowerCase().trim();
    if (!t) return this.lista();
    return this.lista().filter(tc =>
      tc.nombre?.toLowerCase().includes(t) ||
      String(tc.id).includes(t)
    );
  }

  protected formVacio() { return { nombre: '', horasSemanales: 0, descripcion: '', estado: 'activo' }; }
  protected formValido(): boolean { return this.form.nombre !== '' && this.form.horasSemanales > 0; }

  protected abrirCrear() { this.form = this.formVacio(); this.enviado = false; this.modoEditar = false; this.mostrandoModal = true; }
  protected abrirEditar(item: TipoContrato) { this.form = { ...item }; this.enviado = false; this.modoEditar = true; this.mostrandoModal = true; }
  protected cerrarModal() { this.mostrandoModal = false; this.enviado = false; }

  protected confirmarEliminar(id: number, estado: string) { this.idAEliminar = id; this.estadoActual = estado; this.mostrandoConfirmacion = true; }
  protected cerrarConfirmacion() { this.mostrandoConfirmacion = false; this.idAEliminar = 0; this.estadoActual = ''; }
  protected ejecutarEliminar() {
    const msg = this.estadoActual === 'activo' ? 'Tipo de contrato desactivado exitosamente' : 'Tipo de contrato activado exitosamente';
    this.http.post(this.apiUrl + 'Delete', { id: this.idAEliminar }).subscribe({
      next: () => { this.loadTiposContrato(); this.cerrarConfirmacion(); this.notifSvc.mostrar(msg); },
      error: () => { this.cerrarConfirmacion(); this.notifSvc.mostrar('Error al cambiar estado del tipo de contrato', 'error'); },
    });
  }

  protected guardar() {
    this.enviado = true;
    if (!this.formValido()) return;
    if (this.modoEditar) {
      this.http.post(this.apiUrl + 'Update', this.form).subscribe({
        next: () => { this.loadTiposContrato(); this.cerrarModal(); this.notifSvc.mostrar('Tipo de contrato actualizado exitosamente'); },
        error: () => this.notifSvc.mostrar('Error al actualizar el tipo de contrato', 'error'),
      });
    } else {
      this.http.post(this.apiUrl + 'Create', this.form).subscribe({
        next: () => { this.loadTiposContrato(); this.cerrarModal(); this.notifSvc.mostrar('Tipo de contrato creado exitosamente'); },
        error: () => this.notifSvc.mostrar('Error al crear el tipo de contrato', 'error'),
      });
    }
  }
  cerrar() { this.router.navigate(["/"]); }
}
