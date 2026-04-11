import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface BonificacionPago {
  id: number; pago: string; tipo_bonificacion: string;
  monto: number; observaciones: string;
}

@Component({
  selector: 'app-crud-bonificacionpago',
  imports: [FormsModule],
  templateUrl: './crud-bonificacionpago.html',
  styleUrl: './crud-bonificacionpago.css',
})
export class CrudBonificacionpago {
  mostrandoModal = false;
  modoEditar = false;
  enviado = false;

  lista: BonificacionPago[] = [];
  form: any = this.formVacio();

  formVacio() {
    return { id_pago: '', id_tipobonificacion: '', monto: '', observaciones: '' };
  }

  camposRequeridos() { return ['id_pago', 'id_tipobonificacion', 'monto']; }

  formValido(): boolean {
    return this.camposRequeridos().every(c => this.form[c] !== '' && this.form[c] !== null);
  }

  abrirCrear() { this.form = this.formVacio(); this.enviado = false; this.modoEditar = false; this.mostrandoModal = true; }
  abrirEditar(item: BonificacionPago) { this.form = { ...item, id_pago: item.pago, id_tipobonificacion: item.tipo_bonificacion }; this.enviado = false; this.modoEditar = true; this.mostrandoModal = true; }
  cerrarModal() { this.mostrandoModal = false; this.enviado = false; }

  guardar() {
    this.enviado = true;
    if (this.formValido()) { this.cerrarModal(); }
  }
}
