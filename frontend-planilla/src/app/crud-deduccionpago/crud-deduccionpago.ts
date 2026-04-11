import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface DeduccionPago {
  id: number; pago: string; tipo_deduccion: string;
  monto: number; observaciones: string;
}

@Component({
  selector: 'app-crud-deduccionpago',
  imports: [FormsModule],
  templateUrl: './crud-deduccionpago.html',
  styleUrl: './crud-deduccionpago.css',
})
export class CrudDeduccionpago {
  mostrandoModal = false;
  modoEditar = false;
  enviado = false;

  lista: DeduccionPago[] = [];
  form: any = this.formVacio();

  formVacio() {
    return { id_pago: '', id_tipodeduccion: '', monto: '', observaciones: '' };
  }

  camposRequeridos() { return ['id_pago', 'id_tipodeduccion', 'monto']; }

  formValido(): boolean {
    return this.camposRequeridos().every(c => this.form[c] !== '' && this.form[c] !== null);
  }

  abrirCrear() { this.form = this.formVacio(); this.enviado = false; this.modoEditar = false; this.mostrandoModal = true; }
  abrirEditar(item: DeduccionPago) { this.form = { ...item, id_pago: item.pago, id_tipodeduccion: item.tipo_deduccion }; this.enviado = false; this.modoEditar = true; this.mostrandoModal = true; }
  cerrarModal() { this.mostrandoModal = false; this.enviado = false; }

  guardar() {
    this.enviado = true;
    if (this.formValido()) { this.cerrarModal(); }
  }
}
