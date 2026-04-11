import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface TipoDeduccion {
  id: number; codigo: string; nombre: string; porcentaje: number;
  monto_fijo: number; obligatorio: boolean; estado: string; creacion: string;
}

@Component({
  selector: 'app-crud-tipodeduccion',
  imports: [FormsModule],
  templateUrl: './crud-tipodeduccion.html',
  styleUrl: './crud-tipodeduccion.css',
})
export class CrudTipodeduccion {
  mostrandoModal = false;
  modoEditar = false;
  enviado = false;

  lista: TipoDeduccion[] = [];
  form: any = this.formVacio();

  formVacio() {
    return { codigo: '', nombre: '', porcentaje: '', monto_fijo: '', obligatorio: false, estado: '' };
  }

  camposRequeridos() { return ['codigo', 'nombre', 'estado']; }

  formValido(): boolean {
    return this.camposRequeridos().every(c => this.form[c] !== '' && this.form[c] !== null);
  }

  abrirCrear() { this.form = this.formVacio(); this.enviado = false; this.modoEditar = false; this.mostrandoModal = true; }
  abrirEditar(item: TipoDeduccion) { this.form = { ...item }; this.enviado = false; this.modoEditar = true; this.mostrandoModal = true; }
  cerrarModal() { this.mostrandoModal = false; this.enviado = false; }

  guardar() {
    this.enviado = true;
    if (this.formValido()) { this.cerrarModal(); }
  }
}
