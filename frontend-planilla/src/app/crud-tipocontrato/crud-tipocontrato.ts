import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface TipoContrato {
  id: number; nombre: string; horas_semanales: number;
  descripcion: string; estado: string; creacion: string;
}

@Component({
  selector: 'app-crud-tipocontrato',
  imports: [FormsModule],
  templateUrl: './crud-tipocontrato.html',
  styleUrl: './crud-tipocontrato.css',
})
export class CrudTipocontrato {
  mostrandoModal = false;
  modoEditar = false;
  enviado = false;

  lista: TipoContrato[] = [];
  form: any = this.formVacio();

  formVacio() {
    return { nombre: '', horas_semanales: '', descripcion: '', estado: '' };
  }

  camposRequeridos() { return ['nombre', 'horas_semanales', 'estado']; }

  formValido(): boolean {
    return this.camposRequeridos().every(c => this.form[c] !== '' && this.form[c] !== null);
  }

  abrirCrear() { this.form = this.formVacio(); this.enviado = false; this.modoEditar = false; this.mostrandoModal = true; }
  abrirEditar(item: TipoContrato) { this.form = { ...item }; this.enviado = false; this.modoEditar = true; this.mostrandoModal = true; }
  cerrarModal() { this.mostrandoModal = false; this.enviado = false; }

  guardar() {
    this.enviado = true;
    if (this.formValido()) { this.cerrarModal(); }
  }
}
