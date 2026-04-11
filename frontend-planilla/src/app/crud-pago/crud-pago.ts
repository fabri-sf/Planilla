import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Pago {
  id: number; empleado: string; planilla: string; salario_base: number;
  dias_trabajados: number; dias_esperados: number; horas_extra: number;
  total_bruto: number; total_deducciones: number; total_bonificaciones: number;
  salario_neto: number; observaciones: string; fecha: string;
}

@Component({
  selector: 'app-crud-pago',
  imports: [FormsModule],
  templateUrl: './crud-pago.html',
  styleUrl: './crud-pago.css',
})
export class CrudPago {
  mostrandoModal = false;
  modoEditar = false;
  enviado = false;

  lista: Pago[] = [];
  form: any = this.formVacio();

  formVacio() {
    return { id_empleado: '', id_planilla: '', salario_base: '', dias_trabajados: '', dias_esperados: '', horas_extra: '', total_bruto: '', total_deducciones: '', total_bonificaciones: '', salario_neto: '', observaciones: '' };
  }

  camposRequeridos() { return ['id_empleado', 'id_planilla', 'salario_base', 'dias_trabajados', 'dias_esperados', 'salario_neto']; }

  formValido(): boolean {
    return this.camposRequeridos().every(c => this.form[c] !== '' && this.form[c] !== null);
  }

  abrirCrear() { this.form = this.formVacio(); this.enviado = false; this.modoEditar = false; this.mostrandoModal = true; }
  abrirEditar(item: Pago) { this.form = { ...item, id_empleado: item.empleado, id_planilla: item.planilla }; this.enviado = false; this.modoEditar = true; this.mostrandoModal = true; }
  cerrarModal() { this.mostrandoModal = false; this.enviado = false; }

  guardar() {
    this.enviado = true;
    if (this.formValido()) { this.cerrarModal(); }
  }
}
