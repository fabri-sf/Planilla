import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

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
  private readonly apiUrl = 'http://localhost/ServicioPuesto/';

  protected readonly lista = signal<Puesto[]>([]);
  protected mostrandoModal = false;
  protected modoEditar = false;
  protected enviado = false;
  protected form = this.formVacio();

  ngOnInit() { this.loadPuestos(); }

  protected loadPuestos() {
    this.http.get<Puesto[]>(this.apiUrl + 'ReadAll').subscribe({
      next: (data) => this.lista.set(data),
      error: (err) => console.error('Error loading puestos', err),
    });
  }

  protected formVacio() {
    return { codigo: '', nombre: '', descripcion: '', salarioMin: 0, salarioMax: 0, estado: '' };
  }

  protected formValido(): boolean {
    return this.form.codigo !== '' && this.form.nombre !== '' && this.form.salarioMin > 0 && this.form.salarioMax > 0 && this.form.estado !== '';
  }

  protected abrirCrear() { this.form = this.formVacio(); this.enviado = false; this.modoEditar = false; this.mostrandoModal = true; }
  protected abrirEditar(item: Puesto) { this.form = { ...item }; this.enviado = false; this.modoEditar = true; this.mostrandoModal = true; }
  protected cerrarModal() { this.mostrandoModal = false; this.enviado = false; }

  protected guardar() {
    this.enviado = true;
    if (!this.formValido()) return;
    if (this.modoEditar) {
      this.http.post(this.apiUrl + 'Update', this.form).subscribe({
        next: () => { this.loadPuestos(); this.cerrarModal(); },
        error: (err) => console.error('Error updating puesto', err),
      });
    } else {
      this.http.post(this.apiUrl + 'Create', this.form).subscribe({
        next: () => { this.loadPuestos(); this.cerrarModal(); },
        error: (err) => console.error('Error creating puesto', err),
      });
    }
  }

  protected eliminar(id: number) {
    if (confirm('¿Estás seguro de eliminar este puesto?')) {
      this.http.post(this.apiUrl + 'Delete', { id }).subscribe({
        next: () => this.loadPuestos(),
        error: (err) => console.error('Error deleting puesto', err),
      });
    }
  }
}
