import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificacionService } from '../notificacion.service';

interface Asistencia {
  id: number; empleadoId: number; fecha: string;
  horaEntrada: string; horaSalida: string; horasTrabajadas: number;
  horasExtras: number; observaciones: string; creacion: string;
}

interface Empleado { id: number; nombre: string; apellido: string; }

@Component({
  selector: 'app-crud-asistencia',
  imports: [FormsModule],
  templateUrl: './crud-asistencia.html',
  styleUrl: './crud-asistencia.css',
})
export class CRUDAsistencia implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly notifSvc = inject(NotificacionService);
  private readonly apiUrl = 'http://localhost/ServicioAsistencia/';

  protected readonly lista = signal<Asistencia[]>([]);
  protected readonly empleados = signal<Empleado[]>([]);
  protected mostrandoModal = false;
  protected modoEditar = false;
  protected form = this.formVacio();
  protected mostrandoConfirmacion = false;
  protected idAEliminar = 0;
  protected terminoBusqueda = '';

  ngOnInit() {
    this.loadAsistencia();
    this.http.get<Empleado[]>('http://localhost/ServicioEmpleado/ReadAll').subscribe({ next: (d) => this.empleados.set(d), error: () => {} });
  }

  protected get listaFiltrada(): Asistencia[] {
    const t = this.terminoBusqueda.toLowerCase().trim();
    if (!t) return this.lista();
    return this.lista().filter(a =>
      this.nombreEmpleado(a.empleadoId).toLowerCase().includes(t) ||
      a.fecha?.toLowerCase().includes(t) ||
      String(a.id).includes(t)
    );
  }

  protected loadAsistencia() {
    this.http.get<Asistencia[]>(this.apiUrl + 'ReadAll').subscribe({
      next: (data) => this.lista.set(data),
      error: (err) => console.error('Error loading asistencia', err),
    });
  }

  protected nombreEmpleado(id: number): string {
    const e = this.empleados().find(e => e.id === id);
    return e ? `${e.nombre} ${e.apellido}` : String(id);
  }

  protected formVacio() {
    return { id: 0, empleadoId: 0, fecha: '', horaEntrada: '', horaSalida: '', horasTrabajadas: 0, horasExtras: 0, observaciones: '' };
  }

  protected abrirCrear() { this.form = this.formVacio(); this.modoEditar = false; this.mostrandoModal = true; }
  protected abrirEditar(item: Asistencia) { this.form = { ...item }; this.modoEditar = true; this.mostrandoModal = true; }
  protected cerrarModal() { this.mostrandoModal = false; }

  protected confirmarEliminar(id: number) { this.idAEliminar = id; this.mostrandoConfirmacion = true; }
  protected cerrarConfirmacion() { this.mostrandoConfirmacion = false; this.idAEliminar = 0; }
  protected ejecutarEliminar() {
    this.http.post(this.apiUrl + 'Delete', { id: this.idAEliminar }).subscribe({
      next: () => { this.loadAsistencia(); this.cerrarConfirmacion(); this.notifSvc.mostrar('Registro de asistencia eliminado'); },
      error: () => { this.cerrarConfirmacion(); this.notifSvc.mostrar('Error al eliminar el registro', 'error'); },
    });
  }

  protected guardar() {
    if (this.modoEditar) {
      this.http.post(this.apiUrl + 'Update', this.form).subscribe({
        next: () => { this.loadAsistencia(); this.cerrarModal(); this.notifSvc.mostrar('Asistencia actualizada exitosamente'); },
        error: () => this.notifSvc.mostrar('Error al actualizar la asistencia', 'error'),
      });
    } else {
      this.http.post(this.apiUrl + 'Create', this.form).subscribe({
        next: () => { this.loadAsistencia(); this.cerrarModal(); this.notifSvc.mostrar('Asistencia registrada exitosamente'); },
        error: () => this.notifSvc.mostrar('Error al registrar la asistencia', 'error'),
      });
    }
  }
  cerrar() { this.router.navigate(["/"]); }
}
