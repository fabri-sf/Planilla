import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Usuario {
  id: number; nombre_usuario: string; correo: string;
  rol: string; empleado: string; estado: string;
  ultimo_acceso: string; creacion: string;
}

@Component({
  selector: 'app-crud-usuario',
  imports: [FormsModule],
  templateUrl: './crud-usuario.html',
  styleUrl: './crud-usuario.css',
})
export class CrudUsuario {
  mostrandoModal = false;
  modoEditar = false;
  enviado = false;

  lista: Usuario[] = [];
  form: any = this.formVacio();

  formVacio() {
    return { nombre_usuario: '', correo: '', contrasena: '', rol: '', id_empleado: '', estado: '' };
  }

  camposRequeridos() { return ['nombre_usuario', 'correo', 'rol', 'estado']; }

  formValido(): boolean {
    return this.camposRequeridos().every(c => this.form[c] !== '' && this.form[c] !== null);
  }

  abrirCrear() { this.form = this.formVacio(); this.enviado = false; this.modoEditar = false; this.mostrandoModal = true; }
  abrirEditar(item: Usuario) { this.form = { ...item, id_empleado: item.empleado, contrasena: '' }; this.enviado = false; this.modoEditar = true; this.mostrandoModal = true; }
  cerrarModal() { this.mostrandoModal = false; this.enviado = false; }

  guardar() {
    this.enviado = true;
    if (this.formValido()) { this.cerrarModal(); }
  }
}
