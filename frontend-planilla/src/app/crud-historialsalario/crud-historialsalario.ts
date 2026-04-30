import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificacionService } from '../notificacion.service';

interface HistorialSalario {
  id: number; empleadoId: number; salarioAnterior: number;
  salarioNuevo: number; motivo: string; autorizadoPor: number; fechaCambio: string;
}

interface Empleado { id: number; nombre: string; apellido: string; }
interface Usuario { id: number; nombreUsuario: string; rol: string; }

@Component({
  selector: 'app-crud-historialsalario',
  imports: [FormsModule],
  templateUrl: './crud-historialsalario.html',
  styleUrl: './crud-historialsalario.css',
})
export class CrudHistorialsalario implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly notifSvc = inject(NotificacionService);
  private readonly apiUrl = 'http://localhost/ServicioHistorialSalario/';

  protected readonly lista = signal<HistorialSalario[]>([]);
  protected readonly empleados = signal<Empleado[]>([]);
  protected readonly usuarios = signal<Usuario[]>([]);
  protected mostrandoModal = false;
  protected enviado = false;
  protected form = this.formVacio();
  protected terminoBusqueda = '';

  ngOnInit() {
    this.loadHistorial();
    this.http.get<Empleado[]>('http://localhost/ServicioEmpleado/ReadAll').subscribe({ next: (d) => this.empleados.set(d), error: () => {} });
    this.http.get<Usuario[]>('http://localhost/ServicioUsuario/ReadAll').subscribe({ next: (d) => this.usuarios.set(d), error: () => {} });
  }

  protected loadHistorial() {
    this.http.get<HistorialSalario[]>(this.apiUrl + 'ReadAll').subscribe({
      next: (data) => this.lista.set(data),
      error: (err) => console.error('Error loading historial salario', err),
    });
  }

  protected get listaFiltrada(): HistorialSalario[] {
    const t = this.terminoBusqueda.toLowerCase().trim();
    if (!t) return this.lista();
    return this.lista().filter(h =>
      this.nombreEmpleado(h.empleadoId).toLowerCase().includes(t) ||
      h.motivo?.toLowerCase().includes(t) ||
      String(h.id).includes(t)
    );
  }

  protected get usuariosAutorizadores(): Usuario[] {
    return this.usuarios().filter(u => u.rol === 'admin' || u.rol === 'gerente');
  }

  protected nombreEmpleado(id: number): string {
    const e = this.empleados().find(e => e.id === id);
    return e ? `${e.nombre} ${e.apellido}` : String(id);
  }

  protected nombreUsuario(id: number): string {
    return this.usuarios().find(u => u.id === id)?.nombreUsuario ?? String(id);
  }

  protected formVacio() {
    return { empleadoId: 0, salarioAnterior: 0, salarioNuevo: 0, motivo: '', autorizadoPor: 0 };
  }

  protected formValido(): boolean {
    return this.form.empleadoId > 0 && this.form.salarioAnterior > 0 && this.form.salarioNuevo > 0;
  }

  protected abrirCrear() { this.form = this.formVacio(); this.enviado = false; this.mostrandoModal = true; }
  protected cerrarModal() { this.mostrandoModal = false; this.enviado = false; }

  protected guardar() {
    this.enviado = true;
    if (!this.formValido()) return;
    this.http.post(this.apiUrl + 'Create', this.form).subscribe({
      next: () => { this.loadHistorial(); this.cerrarModal(); this.notifSvc.mostrar('Cambio salarial registrado exitosamente'); },
      error: () => this.notifSvc.mostrar('Error al registrar el cambio salarial', 'error'),
    });
  }
  cerrar() { this.router.navigate(["/"]); }
}
