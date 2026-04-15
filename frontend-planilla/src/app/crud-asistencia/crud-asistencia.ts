import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Asistencia {
  id: number;
  empleadoId: number;
  fecha: string;
  horaEntrada: string;
  horaSalida: string;
  horasTrabajadas: number;
  horasExtras: number;
  observaciones: string;
  creacion: string;
}

@Component({
  selector: 'app-crud-asistencia',
  imports: [FormsModule],
  templateUrl: './crud-asistencia.html',
  styleUrl: './crud-asistencia.css',
})
export class CRUDAsistencia implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost/ServicioAsistencia/';

  protected readonly lista = signal<Asistencia[]>([]);
  protected mostrandoModal = false;
  protected modoEditar = false;
  protected form = this.formVacio();

  ngOnInit() { this.loadAsistencia(); }

  protected loadAsistencia() {
    this.http.get<Asistencia[]>(this.apiUrl + 'ReadAll').subscribe({
      next: (data) => this.lista.set(data),
      error: (err) => console.error('Error loading asistencia', err),
    });
  }

  protected formVacio() {
    return {
      id: 0,
      empleadoId: 0,
      fecha: '',
      horaEntrada: '',
      horaSalida: '',
      horasTrabajadas: 0,
      horasExtras: 0,
      observaciones: '',
    };
  }

  protected abrirCrear() { this.form = this.formVacio(); this.modoEditar = false; this.mostrandoModal = true; }
  protected abrirEditar(item: Asistencia) { this.form = { ...item }; this.modoEditar = true; this.mostrandoModal = true; }
  protected cerrarModal() { this.mostrandoModal = false; }

  protected guardar() {
    if (this.modoEditar) {
      this.http.post(this.apiUrl + 'Update', this.form).subscribe({
        next: () => { this.loadAsistencia(); this.cerrarModal(); },
        error: (err) => console.error('Error updating asistencia', err),
      });
    } else {
      this.http.post(this.apiUrl + 'Create', this.form).subscribe({
        next: () => { this.loadAsistencia(); this.cerrarModal(); },
        error: (err) => console.error('Error creating asistencia', err),
      });
    }
  }

  protected eliminar(id: number) {
    if (confirm('¿Estás seguro de eliminar este registro de asistencia?')) {
      this.http.post(this.apiUrl + 'Delete', { id }).subscribe({
        next: () => this.loadAsistencia(),
        error: (err) => console.error('Error deleting asistencia', err),
      });
    }
  }
}