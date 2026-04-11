import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

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
  private readonly apiUrl = 'http://localhost/ServicioDepartamento/';

  protected readonly lista = signal<Departamento[]>([]);
  protected mostrandoModal = false;
  protected modoEditar = false;
  protected form = this.formVacio();

  ngOnInit() { this.loadDepartamentos(); }

  protected loadDepartamentos() {
    this.http.get<Departamento[]>(this.apiUrl + 'ReadAll').subscribe({
      next: (data) => this.lista.set(data),
      error: (err) => console.error('Error loading departamentos', err),
    });
  }

  protected formVacio() {
    return { codigo: '', nombre: '', descripcion: '', estado: '' };
  }

  protected abrirCrear() { this.form = this.formVacio(); this.modoEditar = false; this.mostrandoModal = true; }
  protected abrirEditar(item: Departamento) { this.form = { ...item }; this.modoEditar = true; this.mostrandoModal = true; }
  protected cerrarModal() { this.mostrandoModal = false; }

  protected guardar() {
    if (this.modoEditar) {
      this.http.post(this.apiUrl + 'Update', this.form).subscribe({
        next: () => { this.loadDepartamentos(); this.cerrarModal(); },
        error: (err) => console.error('Error updating departamento', err),
      });
    } else {
      this.http.post(this.apiUrl + 'Create', this.form).subscribe({
        next: () => { this.loadDepartamentos(); this.cerrarModal(); },
        error: (err) => console.error('Error creating departamento', err),
      });
    }
  }

  protected eliminar(id: number) {
    if (confirm('¿Estás seguro de eliminar este departamento?')) {
      this.http.post(this.apiUrl + 'Delete', { id }).subscribe({
        next: () => this.loadDepartamentos(),
        error: (err) => console.error('Error deleting departamento', err),
      });
    }
  }
}
