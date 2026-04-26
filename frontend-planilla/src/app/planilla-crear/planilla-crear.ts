import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificacionService } from '../notificacion.service';

interface Empleado {
  id: number; nombre: string; apellido: string; cedula: string;
  salarioBase: number; estado: string; departamentoId: number;
}
interface Usuario { id: number; nombreUsuario: string; rol: string; }

@Component({
  selector: 'app-planilla-crear',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './planilla-crear.html',
  styleUrl: './planilla-crear.css',
})
export class PlanillaCrear implements OnInit {
  private readonly http      = inject(HttpClient);
  private readonly router    = inject(Router);
  private readonly notifSvc  = inject(NotificacionService);

  protected readonly empleados = signal<Empleado[]>([]);
  protected readonly usuarios  = signal<Usuario[]>([]);

  protected enviado = false;
  protected guardando = false;

  protected form = {
    periodo: '', descripcion: '', fechaInicio: '', fechaFin: '',
    fechaPago: '', observaciones: '', creadoPor: 0,
  };

  // Empleados seleccionados para la planilla
  protected seleccionados = new Set<number>();

  ngOnInit() {
    this.http.get<Empleado[]>('http://localhost/ServicioEmpleado/ReadAll').subscribe({
      next: (d) => {
        const activos = d.filter(e => e.estado === 'activo');
        this.empleados.set(activos);
        activos.forEach(e => this.seleccionados.add(e.id)); // todos seleccionados por defecto
      },
      error: () => {}
    });
    this.http.get<Usuario[]>('http://localhost/ServicioUsuario/ReadAll').subscribe({
      next: (d) => this.usuarios.set(d.filter(u => u.rol === 'admin' || u.rol === 'gerente')),
      error: () => {}
    });
  }

  protected toggleEmpleado(id: number) {
    if (this.seleccionados.has(id)) this.seleccionados.delete(id);
    else this.seleccionados.add(id);
  }

  protected toggleTodos() {
    if (this.seleccionados.size === this.empleados().length) {
      this.seleccionados.clear();
    } else {
      this.empleados().forEach(e => this.seleccionados.add(e.id));
    }
  }

  protected get todosSeleccionados(): boolean {
    return this.empleados().length > 0 && this.seleccionados.size === this.empleados().length;
  }

  protected get errorFechas(): string | null {
    const { fechaInicio, fechaFin, fechaPago } = this.form;
    if (!fechaInicio || !fechaFin || !fechaPago) return null;
    const hoy  = new Date();
    const ini  = new Date(fechaInicio + 'T00:00:00');
    const fin  = new Date(fechaFin    + 'T00:00:00');
    const pago = new Date(fechaPago   + 'T00:00:00');
    if (ini.getMonth() !== hoy.getMonth() || ini.getFullYear() !== hoy.getFullYear())
      return 'La fecha de inicio debe pertenecer al mes actual';
    if (fin <= ini)
      return 'La fecha de fin debe ser posterior a la fecha de inicio';
    if (pago <= ini)
      return 'La fecha de pago debe ser posterior a la fecha de inicio';
    return null;
  }

  protected formValido(): boolean {
    return this.form.periodo !== '' && this.form.fechaInicio !== '' &&
           this.form.fechaFin !== '' && this.form.fechaPago !== '' &&
           this.errorFechas === null;
  }

  protected guardar() {
    this.enviado = true;
    if (!this.formValido()) return;
    this.guardando = true;

    // Excluir observaciones (no existe en PLANILLA) y sanitizar creadoPor
    const { observaciones, ...resto } = this.form;
    const payload = {
      ...resto,
      estado: 'borrador',
      creadoPor: this.form.creadoPor > 0 ? this.form.creadoPor : null,
    };

    this.http.post<any>('http://localhost/ServicioPlanilla/Create', payload).subscribe({
      next: (res) => {
        if (!res || !res.insertId) {
          // El backend respondió 200 pero no creó el registro (error silencioso en BD)
          this.notifSvc.mostrar('Error al crear la planilla — revise la consola del servidor', 'error');
          this.guardando = false;
          return;
        }
        this.notifSvc.mostrar('Planilla creada exitosamente');
        this.router.navigate(['/planilla']);
      },
      error: (e) => {
        this.notifSvc.mostrar(e.error?.error ?? 'Error al crear la planilla', 'error');
        this.guardando = false;
      },
    });
  }

  protected cancelar() { this.router.navigate(['/planilla']); }

  protected fmtMoneda(val: number): string {
    return '₡' + Number(val).toLocaleString('es-CR', { minimumFractionDigits: 0 });
  }
}
