import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificacionService } from '../notificacion.service';

interface Puesto {
  id: number; codigo: string; nombre: string; descripcion: string;
  salarioMin: number; salarioMax: number; estado: string; creacion: string;
}

@Component({
  selector: 'app-crud-puesto',
  imports: [FormsModule],
  templateUrl: './crud-puesto.html',
  styleUrl: './crud-puesto.css',
})
export class CrudPuesto implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly notifSvc = inject(NotificacionService);
  private readonly apiUrl = 'http://localhost/ServicioPuesto/';

  protected readonly lista = signal<Puesto[]>([]);
  protected mostrandoModal = false;
  protected modoEditar = false;
  protected enviado = false;
  protected form = this.formVacio();
  protected mostrandoConfirmacion = false;
  protected idAEliminar = 0;
  protected estadoActual = '';
  protected terminoBusqueda = '';
  protected codigoSufijo = '';

  ngOnInit() { this.loadPuestos(); }

  protected loadPuestos() {
    this.http.get<Puesto[]>(this.apiUrl + 'ReadAll').subscribe({
      next: (data) => this.lista.set(data),
      error: (err) => console.error('Error loading puestos', err),
    });
  }

  protected get listaFiltrada(): Puesto[] {
    const t = this.terminoBusqueda.toLowerCase().trim();
    if (!t) return this.lista();
    return this.lista().filter(p =>
      p.nombre?.toLowerCase().includes(t) ||
      p.codigo?.toLowerCase().includes(t) ||
      String(p.id).includes(t)
    );
  }

  protected formVacio() { return { codigo: '', nombre: '', descripcion: '', salarioMin: 0, salarioMax: 0, estado: 'activo' }; }
  protected formValido(): boolean { return this.codigoSufijo !== '' && this.form.nombre !== '' && this.form.salarioMin > 0 && this.form.salarioMax > 0; }

  protected abrirCrear() {
    this.form = this.formVacio();
    this.codigoSufijo = '';
    this.enviado = false; this.modoEditar = false; this.mostrandoModal = true;
  }
  protected abrirEditar(item: Puesto) {
    this.form = { ...item };
    this.codigoSufijo = item.codigo.startsWith('PUE-') ? item.codigo.slice(4) : item.codigo;
    this.enviado = false; this.modoEditar = true; this.mostrandoModal = true;
  }
  protected cerrarModal() { this.mostrandoModal = false; this.enviado = false; }

  protected confirmarEliminar(id: number, estado: string) { this.idAEliminar = id; this.estadoActual = estado; this.mostrandoConfirmacion = true; }
  protected cerrarConfirmacion() { this.mostrandoConfirmacion = false; this.idAEliminar = 0; this.estadoActual = ''; }
  protected ejecutarEliminar() {
    const msg = this.estadoActual === 'activo' ? 'Puesto desactivado exitosamente' : 'Puesto activado exitosamente';
    this.http.post(this.apiUrl + 'Delete', { id: this.idAEliminar }).subscribe({
      next: () => { this.loadPuestos(); this.cerrarConfirmacion(); this.notifSvc.mostrar(msg); },
      error: () => { this.cerrarConfirmacion(); this.notifSvc.mostrar('Error al cambiar estado del puesto', 'error'); },
    });
  }

  protected guardar() {
    this.enviado = true;
    if (!this.formValido()) return;
    this.form.codigo = 'PUE-' + this.codigoSufijo;
    if (this.modoEditar) {
      this.http.post(this.apiUrl + 'Update', this.form).subscribe({
        next: () => { this.loadPuestos(); this.cerrarModal(); this.notifSvc.mostrar('Puesto actualizado exitosamente'); },
        error: () => this.notifSvc.mostrar('Error al actualizar el puesto', 'error'),
      });
    } else {
      this.http.post(this.apiUrl + 'Create', this.form).subscribe({
        next: () => { this.loadPuestos(); this.cerrarModal(); this.notifSvc.mostrar('Puesto creado exitosamente'); },
        error: () => this.notifSvc.mostrar('Error al crear el puesto', 'error'),
      });
    }
  }
  cerrar() { this.router.navigate(["/"]); }
}
