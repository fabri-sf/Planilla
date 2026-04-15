import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Pago {
  id: number; empleadoId: number; planillaId: number; salarioBase: number;
  diasTrabajados: number; diasEsperados: number; horasExtras: number;
  totalBruto: number; totalDeducciones: number; totalBonificaciones: number;
  salarioNeto: number; observaciones: string; fecha: string;
}

@Component({
  selector: 'app-crud-pago',
  imports: [FormsModule],
  templateUrl: './crud-pago.html',
  styleUrl: './crud-pago.css',
})
export class CrudPago implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost/ServicioPago/';

  protected readonly lista = signal<Pago[]>([]);
  protected mostrandoModal = false;
  protected modoEditar = false;
  protected enviado = false;
  protected form = this.formVacio();

  ngOnInit() { this.loadPagos(); }

  protected loadPagos() {
    this.http.get<Pago[]>(this.apiUrl + 'ReadAll').subscribe({
      next: (data) => this.lista.set(data),
      error: (err) => console.error('Error loading pagos', err),
    });
  }

  protected formVacio() {
    return { empleadoId: 0, planillaId: 0, salarioBase: 0, diasTrabajados: 0, diasEsperados: 0, horasExtras: 0, totalBruto: 0, totalDeducciones: 0, totalBonificaciones: 0, salarioNeto: 0, observaciones: '' };
  }

  protected formValido(): boolean {
    return this.form.empleadoId > 0 && this.form.planillaId > 0 && this.form.salarioBase > 0 && this.form.diasTrabajados > 0 && this.form.diasEsperados > 0;
  }

  protected abrirCrear() { this.form = this.formVacio(); this.enviado = false; this.modoEditar = false; this.mostrandoModal = true; }
  protected abrirEditar(item: Pago) { this.form = { ...item }; this.enviado = false; this.modoEditar = true; this.mostrandoModal = true; }
  protected cerrarModal() { this.mostrandoModal = false; this.enviado = false; }

  protected guardar() {
    this.enviado = true;
    if (!this.formValido()) return;
    if (this.modoEditar) {
      this.http.post(this.apiUrl + 'Update', this.form).subscribe({
        next: () => { this.loadPagos(); this.cerrarModal(); },
        error: (err) => console.error('Error updating pago', err),
      });
    } else {
      this.http.post(this.apiUrl + 'Create', this.form).subscribe({
        next: () => { this.loadPagos(); this.cerrarModal(); },
        error: (err) => console.error('Error creating pago', err),
      });
    }
  }
}
