import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificacionService } from '../notificacion.service';

interface Usuario {
  id: number; nombreUsuario: string; correo: string;
  rol: string; empleadoId: number; estado: string;
  ultimoAcceso: string; creacion: string;
}

interface Empleado { id: number; nombre: string; apellido: string; }

@Component({
  selector: 'app-crud-usuario',
  imports: [FormsModule],
  templateUrl: './crud-usuario.html',
  styleUrl: './crud-usuario.css',
})
export class CrudUsuario implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly notifSvc = inject(NotificacionService);
  private readonly apiUrl = 'http://localhost/ServicioUsuario/';

  protected readonly lista = signal<Usuario[]>([]);
  protected readonly empleados = signal<Empleado[]>([]);
  protected mostrandoModal = false;
  protected modoEditar = false;
  protected enviado = false;
  protected form = this.formVacio();
  protected mostrandoConfirmacion = false;
  protected idAEliminar = 0;
  protected estadoActual = '';
  protected terminoBusqueda = '';

  ngOnInit() {
    this.loadUsuarios();
    this.http.get<Empleado[]>('http://localhost/ServicioEmpleado/ReadAll').subscribe({ next: (d) => this.empleados.set(d), error: () => {} });
  }

  protected loadUsuarios() {
    this.http.get<Usuario[]>(this.apiUrl + 'ReadAll').subscribe({
      next: (data) => this.lista.set(data),
      error: (err) => console.error('Error loading usuarios', err),
    });
  }

  protected get listaFiltrada(): Usuario[] {
    const t = this.terminoBusqueda.toLowerCase().trim();
    if (!t) return this.lista();
    return this.lista().filter(u =>
      u.nombreUsuario?.toLowerCase().includes(t) ||
      u.correo?.toLowerCase().includes(t) ||
      u.rol?.toLowerCase().includes(t) ||
      String(u.id).includes(t)
    );
  }

  protected nombreEmpleado(id: number): string {
    const e = this.empleados().find(e => e.id === id);
    return e ? `${e.nombre} ${e.apellido}` : id > 0 ? String(id) : '—';
  }

  protected empleadosDisponibles(): Empleado[] {
    const usados = new Set(
      this.lista()
        .filter(u => u.empleadoId > 0 && u.empleadoId !== this.form.empleadoId)
        .map(u => u.empleadoId)
    );
    return this.empleados().filter(e => !usados.has(e.id));
  }

  protected formVacio() {
    return { nombreUsuario: '', correo: '', contrasena: '', rol: '', empleadoId: 0, estado: 'activo' };
  }

  protected formValido(): boolean {
    return this.form.nombreUsuario !== '' && this.form.correo !== '' && this.form.rol !== '' && this.form.estado !== '';
  }

  protected abrirCrear() { this.form = this.formVacio(); this.enviado = false; this.modoEditar = false; this.mostrandoModal = true; }
  protected abrirEditar(item: Usuario) { this.form = { ...item, contrasena: '' }; this.enviado = false; this.modoEditar = true; this.mostrandoModal = true; }
  protected cerrarModal() { this.mostrandoModal = false; this.enviado = false; }

  protected confirmarEliminar(id: number, estado: string) { this.idAEliminar = id; this.estadoActual = estado; this.mostrandoConfirmacion = true; }
  protected cerrarConfirmacion() { this.mostrandoConfirmacion = false; this.idAEliminar = 0; this.estadoActual = ''; }
  protected ejecutarEliminar() {
    const msg = this.estadoActual === 'activo' ? 'Usuario desactivado exitosamente' : 'Usuario activado exitosamente';
    this.http.post(this.apiUrl + 'Delete', { id: this.idAEliminar }).subscribe({
      next: () => { this.loadUsuarios(); this.cerrarConfirmacion(); this.notifSvc.mostrar(msg); },
      error: () => { this.cerrarConfirmacion(); this.notifSvc.mostrar('Error al cambiar estado del usuario', 'error'); },
    });
  }

  protected guardar() {
    this.enviado = true;
    if (!this.formValido()) return;
    if (this.modoEditar) {
      this.http.post(this.apiUrl + 'Update', this.form).subscribe({
        next: () => { this.loadUsuarios(); this.cerrarModal(); this.notifSvc.mostrar('Usuario actualizado exitosamente'); },
        error: () => this.notifSvc.mostrar('Error al actualizar el usuario', 'error'),
      });
    } else {
      this.http.post(this.apiUrl + 'Create', this.form).subscribe({
        next: () => { this.loadUsuarios(); this.cerrarModal(); this.notifSvc.mostrar('Usuario creado exitosamente'); },
        error: () => this.notifSvc.mostrar('Error al crear el usuario', 'error'),
      });
    }
  }
  cerrar() { this.router.navigate(["/"]); }
}
