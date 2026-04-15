import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Planilla {
  id: number; periodo: string; fechaInicio: string; fechaFin: string;
  fechaPago: string; estado: string; descripcion: string;
  creadoPor: number; aprobadoPor: number; creacion: string;
}

@Component({
  selector: 'app-crud-planilla',
  imports: [FormsModule],
  templateUrl: './crud-planilla.html',
  styleUrl: './crud-planilla.css',
})
export class CrudPlanilla implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost/ServicioPlanilla/';

  protected readonly lista = signal<Planilla[]>([]);
  protected mostrandoModal = false;
  protected modoEditar = false;
  protected enviado = false;
  protected form = this.formVacio();

  ngOnInit() { this.loadPlanillas(); }

  protected loadPlanillas() {
    this.http.get<Planilla[]>(this.apiUrl + 'ReadAll').subscribe({
      next: (data) => this.lista.set(data),
      error: (err) => console.error('Error loading planillas', err),
    });
  }

  protected formVacio() {
    return { periodo: '', fechaInicio: '', fechaFin: '', fechaPago: '', estado: '', descripcion: '', creadoPor: 0, aprobadoPor: 0 };
  }

  protected formValido(): boolean {
    return this.form.periodo !== '' && this.form.fechaInicio !== '' && this.form.fechaFin !== '' && this.form.fechaPago !== '' && this.form.estado !== '';
  }

  protected abrirCrear() { this.form = this.formVacio(); this.enviado = false; this.modoEditar = false; this.mostrandoModal = true; }
  protected abrirEditar(item: Planilla) { this.form = { ...item }; this.enviado = false; this.modoEditar = true; this.mostrandoModal = true; }
  protected cerrarModal() { this.mostrandoModal = false; this.enviado = false; }

  protected guardar() {
    this.enviado = true;
    if (!this.formValido()) return;
    if (this.modoEditar) {
      this.http.post(this.apiUrl + 'Update', this.form).subscribe({
        next: () => { this.loadPlanillas(); this.cerrarModal(); },
        error: (err) => console.error('Error updating planilla', err),
      });
    } else {
      this.http.post(this.apiUrl + 'Create', this.form).subscribe({
        next: () => { this.loadPlanillas(); this.cerrarModal(); },
        error: (err) => console.error('Error creating planilla', err),
      });
    }
  }
}
