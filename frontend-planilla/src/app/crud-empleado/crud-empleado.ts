import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Empleado {
  id: number; cedula: string; nombre: string; apellido: string;
  email: string; telefono: string; fecha_nacimiento: string;
  fecha_ingreso: string; salario_base: number; estado: string;
  puesto: string; departamento: string; tipocontrato: string;
}

@Component({
  selector: 'app-crud-empleado',
  imports: [FormsModule],
  templateUrl: './crud-empleado.html',
  styleUrl: './crud-empleado.css',
})
export class CrudEmpleado {
  mostrandoModal = false;
  modoEditar = false;
  enviado = false;

  lista: Empleado[] = [];
  form: any = this.formVacio();

  formVacio() {
    return { cedula: '', nombre: '', apellido: '', email: '', telefono: '', fecha_nacimiento: '', fecha_ingreso: '', salario_base: '', estado: '', id_puesto: '', id_departamento: '', id_tipocontrato: '' };
  }

  camposRequeridos() {
    return ['cedula', 'nombre', 'apellido', 'email', 'fecha_ingreso', 'salario_base', 'estado'];
  }

  formValido(): boolean {
    return this.camposRequeridos().every(c => this.form[c] !== '' && this.form[c] !== null && this.form[c] !== undefined);
  }

  abrirCrear() { this.form = this.formVacio(); this.enviado = false; this.modoEditar = false; this.mostrandoModal = true; }
  abrirEditar(item: Empleado) { this.form = { ...item, id_puesto: item.puesto, id_departamento: item.departamento, id_tipocontrato: item.tipocontrato }; this.enviado = false; this.modoEditar = true; this.mostrandoModal = true; }
  cerrarModal() { this.mostrandoModal = false; this.enviado = false; }

  guardar() {
    this.enviado = true;
    if (this.formValido()) { this.cerrarModal(); }
  }
}
