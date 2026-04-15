import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface DeduccionPago {
  id: number;
  pagoId: number;
  tipoDeduccionId: number;
  monto: number;
  observaciones: string;
}

@Component({
  selector: 'app-crud-deduccionpago',
  imports: [FormsModule],
  templateUrl: './crud-deduccionpago.html',
  styleUrl: './crud-deduccionpago.css',
})
export class CrudDeduccionpago implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost/ServicioDeduccionPago/';

  protected readonly lista = signal<DeduccionPago[]>([]);
  protected mostrandoModal = false;
  protected modoEditar = false;
  protected enviado = false;
  protected form = this.formVacio();

  ngOnInit() { this.loadDeducciones(); }

  protected loadDeducciones() {
    this.http.get<DeduccionPago[]>(this.apiUrl + 'ReadAll').subscribe({
      next: (data) => this.lista.set(data),
      error: (err) => console.error('Error loading deducciones', err),
    });
  }

  protected formVacio() {
    return { id: 0, pagoId: 0, tipoDeduccionId: 0, monto: 0, observaciones: '' };
  }

  protected formValido(): boolean {
    return this.form.pagoId > 0 && this.form.tipoDeduccionId > 0 && this.form.monto > 0;
  }

  protected abrirCrear() { this.form = this.formVacio(); this.enviado = false; this.modoEditar = false; this.mostrandoModal = true; }
  protected abrirEditar(item: DeduccionPago) { this.form = { ...item }; this.enviado = false; this.modoEditar = true; this.mostrandoModal = true; }
  protected cerrarModal() { this.mostrandoModal = false; this.enviado = false; }

  protected guardar() {
    this.enviado = true;
    if (!this.formValido()) return;
    if (this.modoEditar) {
      this.http.post(this.apiUrl + 'Edit', this.form).subscribe({
        next: () => { this.loadDeducciones(); this.cerrarModal(); },
        error: (err) => console.error('Error updating deduccion', err),
      });
    } else {
      this.http.post(this.apiUrl + 'Create', this.form).subscribe({
        next: () => { this.loadDeducciones(); this.cerrarModal(); },
        error: (err) => console.error('Error creating deduccion', err),
      });
    }
  }

  protected eliminar(id: number) {
    if (confirm('¿Estás seguro de eliminar esta deducción?')) {
      this.http.post(this.apiUrl + 'Delete', { id }).subscribe({
        next: () => this.loadDeducciones(),
        error: (err) => console.error('Error deleting deduccion', err),
      });
    }
  }
}