import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificacionService } from '../notificacion.service';

interface Empleado {
  id: number; cedula: string; nombre: string; apellido: string;
  email: string; telefono: string; fechaNacimiento: string;
  fechaIngreso: string; salarioBase: number; estado: string;
  puestoId: number; departamentoId: number; tipoContratoId: number;
}

interface Puesto { id: number; nombre: string; }
interface Departamento { id: number; nombre: string; }
interface TipoContrato { id: number; nombre: string; }

@Component({
  selector: 'app-crud-empleado',
  imports: [FormsModule],
  templateUrl: './crud-empleado.html',
  styleUrl: './crud-empleado.css',
})
export class CrudEmpleado implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly notifSvc = inject(NotificacionService);
  private readonly apiUrl = 'http://localhost/ServicioEmpleado/';

  protected readonly lista = signal<Empleado[]>([]);
  protected readonly puestos = signal<Puesto[]>([]);
  protected readonly departamentos = signal<Departamento[]>([]);
  protected readonly tiposContrato = signal<TipoContrato[]>([]);
  protected readonly hoy = new Date().toISOString().split('T')[0];
  protected readonly maxFechaNacimiento = (() => {
    const d = new Date(); d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  })();
  protected mostrandoModal = false;
  protected modoEditar = false;
  protected enviado = false;
  protected form = this.formVacio();
  protected mostrandoConfirmacion = false;
  protected idAEliminar = 0;
  protected estadoActual = '';
  protected terminoBusqueda = '';

  ngOnInit() {
    this.loadEmpleados();
    this.http.get<Puesto[]>('http://localhost/ServicioPuesto/ReadAll').subscribe({ next: (d) => this.puestos.set(d), error: () => {} });
    this.http.get<Departamento[]>('http://localhost/ServicioDepartamento/ReadAll').subscribe({ next: (d) => this.departamentos.set(d), error: () => {} });
    this.http.get<TipoContrato[]>('http://localhost/ServicioTipoContrato/ReadAll').subscribe({ next: (d) => this.tiposContrato.set(d), error: () => {} });
  }

  protected loadEmpleados() {
    this.http.get<Empleado[]>(this.apiUrl + 'ReadAll').subscribe({
      next: (data) => this.lista.set(data),
      error: (err) => console.error('Error loading empleados', err),
    });
  }

  protected get listaFiltrada(): Empleado[] {
    const t = this.terminoBusqueda.toLowerCase().trim();
    if (!t) return this.lista();
    return this.lista().filter(e =>
      e.nombre?.toLowerCase().includes(t) ||
      e.apellido?.toLowerCase().includes(t) ||
      e.cedula?.toLowerCase().includes(t) ||
      e.email?.toLowerCase().includes(t) ||
      String(e.id).includes(t)
    );
  }

  protected nombrePuesto(id: number): string { return this.puestos().find(p => p.id === id)?.nombre ?? String(id); }
  protected nombreDepartamento(id: number): string { return this.departamentos().find(d => d.id === id)?.nombre ?? String(id); }
  protected nombreTipoContrato(id: number): string { return this.tiposContrato().find(t => t.id === id)?.nombre ?? String(id); }

  private formatDate(val: string): string {
    if (!val) return '';
    return val.split('T')[0];
  }

  protected formVacio() {
    return { cedula: '', nombre: '', apellido: '', email: '', telefono: '', fechaNacimiento: '', fechaIngreso: '', salarioBase: 0, estado: 'activo', puestoId: 0, departamentoId: 0, tipoContratoId: 0 };
  }

  protected formValido(): boolean {
    return this.form.cedula.length === 9 && this.form.nombre !== '' && this.form.apellido !== '' && this.form.email !== '' && this.form.fechaIngreso !== '' && this.form.salarioBase > 0 && this.form.estado !== '';
  }

  protected abrirCrear() { this.form = this.formVacio(); this.enviado = false; this.modoEditar = false; this.mostrandoModal = true; }
  protected abrirEditar(item: Empleado) {
    this.form = {
      ...item,
      fechaNacimiento: this.formatDate(item.fechaNacimiento),
      fechaIngreso: this.formatDate(item.fechaIngreso),
    };
    this.enviado = false; this.modoEditar = true; this.mostrandoModal = true;
  }
  protected cerrarModal() { this.mostrandoModal = false; this.enviado = false; }

  protected confirmarEliminar(id: number, estado: string) { this.idAEliminar = id; this.estadoActual = estado; this.mostrandoConfirmacion = true; }
  protected cerrarConfirmacion() { this.mostrandoConfirmacion = false; this.idAEliminar = 0; this.estadoActual = ''; }
  protected ejecutarEliminar() {
    const msg = this.estadoActual === 'activo' ? 'Empleado desactivado exitosamente' : 'Empleado activado exitosamente';
    this.http.post(this.apiUrl + 'Delete', { id: this.idAEliminar }).subscribe({
      next: () => { this.loadEmpleados(); this.cerrarConfirmacion(); this.notifSvc.mostrar(msg); },
      error: () => { this.cerrarConfirmacion(); this.notifSvc.mostrar('Error al cambiar estado del empleado', 'error'); },
    });
  }

  protected guardar() {
    this.enviado = true;
    if (!this.formValido()) return;
    if (this.modoEditar) {
      this.http.post(this.apiUrl + 'Update', this.form).subscribe({
        next: () => { this.loadEmpleados(); this.cerrarModal(); this.notifSvc.mostrar('Empleado actualizado exitosamente'); },
        error: () => this.notifSvc.mostrar('Error al actualizar el empleado', 'error'),
      });
    } else {
      this.http.post(this.apiUrl + 'Create', this.form).subscribe({
        next: () => { this.loadEmpleados(); this.cerrarModal(); this.notifSvc.mostrar('Empleado creado exitosamente'); },
        error: () => this.notifSvc.mostrar('Error al crear el empleado', 'error'),
      });
    }
  }
  cerrar() { this.router.navigate(["/"]); }
}
