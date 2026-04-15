import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface BonificacionPago {
  id: number;
  pagoId: number;
  tipoBonificacionId: number;
  monto: number;
  observaciones: string;
}

@Component({
  selector: 'app-crud-bonificacionpago',
  imports: [FormsModule],
  templateUrl: './crud-bonificacionpago.html',
  styleUrl: './crud-bonificacionpago.css',
})
export class CrudBonificacionpago implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost/ServicioBonificacionPago/';

  protected readonly lista = signal<BonificacionPago[]>([]);
  protected mostrandoModal = false;
  protected modoEditar = false;
  protected enviado = false;
  protected form = this.formVacio();

  ngOnInit() { this.loadBonificaciones(); }

  protected loadBonificaciones() {
    this.http.get<BonificacionPago[]>(this.apiUrl + 'ReadAll').subscribe({
      next: (data) => this.lista.set(data),
      error: (err) => console.error('Error loading bonificaciones', err),
    });
  }

  protected formVacio() {
    return { id: 0, pagoId: 0, tipoBonificacionId: 0, monto: 0, observaciones: '' };
  }

  protected formValido(): boolean {
    return this.form.pagoId > 0 && this.form.tipoBonificacionId > 0 && this.form.monto > 0;
  }

  protected abrirCrear() { this.form = this.formVacio(); this.enviado = false; this.modoEditar = false; this.mostrandoModal = true; }
  protected abrirEditar(item: BonificacionPago) { this.form = { ...item }; this.enviado = false; this.modoEditar = true; this.mostrandoModal = true; }
  protected cerrarModal() { this.mostrandoModal = false; this.enviado = false; }

  protected guardar() {
    this.enviado = true;
    if (!this.formValido()) return;
    if (this.modoEditar) {
      this.http.post(this.apiUrl + 'Update', this.form).subscribe({
        next: () => { this.loadBonificaciones(); this.cerrarModal(); },
        error: (err) => console.error('Error updating bonificacion', err),
      });
    } else {
      this.http.post(this.apiUrl + 'Create', this.form).subscribe({
        next: () => { this.loadBonificaciones(); this.cerrarModal(); },
        error: (err) => console.error('Error creating bonificacion', err),
      });
    }
  }

  protected eliminar(id: number) {
    if (confirm('¿Estás seguro de eliminar esta bonificación?')) {
      this.http.post(this.apiUrl + 'Delete', { id }).subscribe({
        next: () => this.loadBonificaciones(),
        error: (err) => console.error('Error deleting bonificacion', err),
      });
    }
  }
}