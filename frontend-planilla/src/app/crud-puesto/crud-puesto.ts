import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Puesto {
  id: number; codigo: string; nombre: string; descripcion: string;
  salario_minimo: number; salario_maximo: number; estado: string; creacion: string;
}

@Component({
  selector: 'app-crud-puesto',
  imports: [FormsModule],
  templateUrl: './crud-puesto.html',
  styleUrl: './crud-puesto.css',
})
export class CrudPuesto {
  mostrandoModal = false;
  modoEditar = false;
  enviado = false;

  lista: Puesto[] = [];
  form: any = this.formVacio();

  formVacio() {
    return { codigo: '', nombre: '', descripcion: '', salario_minimo: '', salario_maximo: '', estado: '' };
  }

  camposRequeridos() { return ['codigo', 'nombre', 'salario_minimo', 'salario_maximo', 'estado']; }

  formValido(): boolean {
    return this.camposRequeridos().every(c => this.form[c] !== '' && this.form[c] !== null);
  }

  abrirCrear() { this.form = this.formVacio(); this.enviado = false; this.modoEditar = false; this.mostrandoModal = true; }
  abrirEditar(item: Puesto) { this.form = { ...item }; this.enviado = false; this.modoEditar = true; this.mostrandoModal = true; }
  cerrarModal() { this.mostrandoModal = false; this.enviado = false; }

  guardar() {
    this.enviado = true;
    if (this.formValido()) { this.cerrarModal(); }
  }
}
