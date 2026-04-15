import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Empleado {
  id: number; cedula: string; nombre: string; apellido: string;
  email: string; telefono: string; fechaNacimiento: string;
  fechaIngreso: string; salarioBase: number; estado: string;
  puestoId: number; departamentoId: number; tipoContratoId: number;
}

@Component({
  selector: 'app-crud-empleado',
  imports: [FormsModule],
  templateUrl: './crud-empleado.html',
  styleUrl: './crud-empleado.css',
})
export class CrudEmpleado implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost/ServicioEmpleado/';

  protected readonly lista = signal<Empleado[]>([]);
  protected mostrandoModal = false;
  protected modoEditar = false;
  protected enviado = false;
  protected form = this.formVacio();

  ngOnInit() { this.loadEmpleados(); }

  protected loadEmpleados() {
    this.http.get<Empleado[]>(this.apiUrl + 'ReadAll').subscribe({
      next: (data) => this.lista.set(data),
      error: (err) => console.error('Error loading empleados', err),
    });
  }

  protected formVacio() {
    return { cedula: '', nombre: '', apellido: '', email: '', telefono: '', fechaNacimiento: '', fechaIngreso: '', salarioBase: 0, estado: '', puestoId: 0, departamentoId: 0, tipoContratoId: 0 };
  }

  protected formValido(): boolean {
    return this.form.cedula !== '' && this.form.nombre !== '' && this.form.apellido !== '' && this.form.email !== '' && this.form.fechaIngreso !== '' && this.form.salarioBase > 0 && this.form.estado !== '';
  }

  protected abrirCrear() { this.form = this.formVacio(); this.enviado = false; this.modoEditar = false; this.mostrandoModal = true; }
  protected abrirEditar(item: Empleado) { this.form = { ...item }; this.enviado = false; this.modoEditar = true; this.mostrandoModal = true; }
  protected cerrarModal() { this.mostrandoModal = false; this.enviado = false; }

  protected guardar() {
    this.enviado = true;
    if (!this.formValido()) return;
    if (this.modoEditar) {
      this.http.post(this.apiUrl + 'Update', this.form).subscribe({
        next: () => { this.loadEmpleados(); this.cerrarModal(); },
        error: (err) => console.error('Error updating empleado', err),
      });
    } else {
      this.http.post(this.apiUrl + 'Create', this.form).subscribe({
        next: () => { this.loadEmpleados(); this.cerrarModal(); },
        error: (err) => console.error('Error creating empleado', err),
      });
    }
  }

  protected eliminar(id: number) {
    if (confirm('¿Estás seguro de eliminar este empleado?')) {
      this.http.post(this.apiUrl + 'Delete', { id }).subscribe({
        next: () => this.loadEmpleados(),
        error: (err) => console.error('Error deleting empleado', err),
      });
    }
  }
}
