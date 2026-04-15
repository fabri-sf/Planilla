import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface HistorialSalario {
  id: number; empleadoId: number; salarioAnterior: number;
  salarioNuevo: number; motivo: string; autorizadoPor: number; fechaCambio: string;
}

@Component({
  selector: 'app-crud-historialsalario',
  imports: [FormsModule],
  templateUrl: './crud-historialsalario.html',
  styleUrl: './crud-historialsalario.css',
})
export class CrudHistorialsalario implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost/ServicioHistorialSalario/';

  protected readonly lista = signal<HistorialSalario[]>([]);
  protected mostrandoModal = false;
  protected modoEditar = false;
  protected enviado = false;
  protected form = this.formVacio();

  ngOnInit() { this.loadHistorial(); }

  protected loadHistorial() {
    this.http.get<HistorialSalario[]>(this.apiUrl + 'ReadAll').subscribe({
      next: (data) => this.lista.set(data),
      error: (err) => console.error('Error loading historial salario', err),
    });
  }

  protected formVacio() {
    return { empleadoId: 0, salarioAnterior: 0, salarioNuevo: 0, motivo: '', autorizadoPor: 0 };
  }

  protected formValido(): boolean {
    return this.form.empleadoId > 0 && this.form.salarioAnterior > 0 && this.form.salarioNuevo > 0;
  }

  protected abrirCrear() { this.form = this.formVacio(); this.enviado = false; this.modoEditar = false; this.mostrandoModal = true; }
  protected abrirEditar(item: HistorialSalario) { this.form = { ...item }; this.enviado = false; this.modoEditar = true; this.mostrandoModal = true; }
  protected cerrarModal() { this.mostrandoModal = false; this.enviado = false; }

  protected guardar() {
    this.enviado = true;
    if (!this.formValido()) return;
    if (this.modoEditar) {
      this.http.post(this.apiUrl + 'Update', this.form).subscribe({
        next: () => { this.loadHistorial(); this.cerrarModal(); },
        error: (err) => console.error('Error updating historial salario', err),
      });
    } else {
      this.http.post(this.apiUrl + 'Create', this.form).subscribe({
        next: () => { this.loadHistorial(); this.cerrarModal(); },
        error: (err) => console.error('Error creating historial salario', err),
      });
    }
  }
}
