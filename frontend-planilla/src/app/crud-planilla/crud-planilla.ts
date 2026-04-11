import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Planilla {
  id: number; periodo: string; fecha_inicio: string; fecha_fin: string;
  fecha_pago: string; estado: string; descripcion: string;
  creado_por: string; aprobado_por: string; creacion: string;
}

@Component({
  selector: 'app-crud-planilla',
  imports: [FormsModule],
  templateUrl: './crud-planilla.html',
  styleUrl: './crud-planilla.css',
})
export class CrudPlanilla {
  mostrandoModal = false;
  modoEditar = false;
  enviado = false;

  lista: Planilla[] = [];
  form: any = this.formVacio();

  formVacio() {
    return { periodo: '', fecha_inicio: '', fecha_fin: '', fecha_pago: '', estado: '', descripcion: '', creado_por: '', aprobado_por: '' };
  }

  camposRequeridos() { return ['periodo', 'fecha_inicio', 'fecha_fin', 'fecha_pago', 'estado']; }

  formValido(): boolean {
    return this.camposRequeridos().every(c => this.form[c] !== '' && this.form[c] !== null);
  }

  abrirCrear() { this.form = this.formVacio(); this.enviado = false; this.modoEditar = false; this.mostrandoModal = true; }
  abrirEditar(item: Planilla) { this.form = { ...item }; this.enviado = false; this.modoEditar = true; this.mostrandoModal = true; }
  cerrarModal() { this.mostrandoModal = false; this.enviado = false; }

  guardar() {
    this.enviado = true;
    if (this.formValido()) { this.cerrarModal(); }
  }
}
