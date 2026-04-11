import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface TipoBonificacion {
  id: number; codigo: string; nombre: string;
  descripcion: string; estado: string; creacion: string;
}

@Component({
  selector: 'app-crud-tipobonificacion',
  imports: [FormsModule],
  templateUrl: './crud-tipobonificacion.html',
  styleUrl: './crud-tipobonificacion.css',
})
export class CrudTipobonificacion {
  mostrandoModal = false;
  modoEditar = false;
  enviado = false;

  lista: TipoBonificacion[] = [];
  form: any = this.formVacio();

  formVacio() {
    return { codigo: '', nombre: '', descripcion: '', estado: '' };
  }

  camposRequeridos() { return ['codigo', 'nombre', 'estado']; }

  formValido(): boolean {
    return this.camposRequeridos().every(c => this.form[c] !== '' && this.form[c] !== null);
  }

  abrirCrear() { this.form = this.formVacio(); this.enviado = false; this.modoEditar = false; this.mostrandoModal = true; }
  abrirEditar(item: TipoBonificacion) { this.form = { ...item }; this.enviado = false; this.modoEditar = true; this.mostrandoModal = true; }
  cerrarModal() { this.mostrandoModal = false; this.enviado = false; }

  guardar() {
    this.enviado = true;
    if (this.formValido()) { this.cerrarModal(); }
  }
}
