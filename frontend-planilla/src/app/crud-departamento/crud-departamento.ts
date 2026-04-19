import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificacionService } from '../notificacion.service';

interface Departamento {
  id: number; codigo: string; nombre: string;
  descripcion: string; estado: string; creacion: string;
}

@Component({
  selector: 'app-crud-departamento',
  imports: [FormsModule],
  templateUrl: './crud-departamento.html',
  styleUrl: './crud-departamento.css',
})
export class CrudDepartamento implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly notifSvc = inject(NotificacionService);
  private readonly apiUrl = 'http://localhost/ServicioDepartamento/';

  protected readonly lista = signal<Departamento[]>([]);
  protected mostrandoModal = false;
  protected modoEditar = false;
  protected form = this.formVacio();
  protected mostrandoConfirmacion = false;
  protected idAEliminar = 0;
  protected estadoActual = '';
  protected terminoBusqueda = '';
  protected codigoSufijo = '';

  ngOnInit() { this.loadDepartamentos(); }

  protected loadDepartamentos() {
    this.http.get<Departamento[]>(this.apiUrl + 'ReadAll').subscribe({
      next: (data) => this.lista.set(data),
      error: (err) => console.error('Error loading departamentos', err),
    });
  }

  protected get listaFiltrada(): Departamento[] {
    const t = this.terminoBusqueda.toLowerCase().trim();
    if (!t) return this.lista();
    return this.lista().filter(d =>
      d.nombre?.toLowerCase().includes(t) ||
      d.codigo?.toLowerCase().includes(t) ||
      String(d.id).includes(t)
    );
  }

  protected formVacio() { return { codigo: '', nombre: '', descripcion: '', estado: 'activo' }; }

  protected abrirCrear() {
    this.form = this.formVacio();
    this.codigoSufijo = '';
    this.modoEditar = false; this.mostrandoModal = true;
  }
  protected abrirEditar(item: Departamento) {
    this.form = { ...item };
    this.codigoSufijo = item.codigo.startsWith('DEP-') ? item.codigo.slice(4) : item.codigo;
    this.modoEditar = true; this.mostrandoModal = true;
  }
  protected cerrarModal() { this.mostrandoModal = false; }

  protected confirmarEliminar(id: number, estado: string) { this.idAEliminar = id; this.estadoActual = estado; this.mostrandoConfirmacion = true; }
  protected cerrarConfirmacion() { this.mostrandoConfirmacion = false; this.idAEliminar = 0; this.estadoActual = ''; }
  protected ejecutarEliminar() {
    const msg = this.estadoActual === 'activo' || this.estadoActual === 'Activo'
      ? 'Departamento desactivado exitosamente'
      : 'Departamento activado exitosamente';
    this.http.post(this.apiUrl + 'Delete', { id: this.idAEliminar }).subscribe({
      next: () => { this.loadDepartamentos(); this.cerrarConfirmacion(); this.notifSvc.mostrar(msg); },
      error: () => { this.cerrarConfirmacion(); this.notifSvc.mostrar('Error al cambiar estado del departamento', 'error'); },
    });
  }

  protected guardar() {
    this.form.codigo = 'DEP-' + this.codigoSufijo;
    if (this.modoEditar) {
      this.http.post(this.apiUrl + 'Update', this.form).subscribe({
        next: () => { this.loadDepartamentos(); this.cerrarModal(); this.notifSvc.mostrar('Departamento actualizado exitosamente'); },
        error: () => this.notifSvc.mostrar('Error al actualizar el departamento', 'error'),
      });
    } else {
      this.http.post(this.apiUrl + 'Create', this.form).subscribe({
        next: () => { this.loadDepartamentos(); this.cerrarModal(); this.notifSvc.mostrar('Departamento creado exitosamente'); },
        error: () => this.notifSvc.mostrar('Error al crear el departamento', 'error'),
      });
    }
  }
  cerrar() { this.router.navigate(["/"]); }
}
