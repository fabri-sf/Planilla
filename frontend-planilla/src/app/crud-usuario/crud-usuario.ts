import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Usuario {
  id: number; nombreUsuario: string; correo: string;
  rol: string; empleadoId: number | null; estado: string;
  ultimoAcceso: string; creacion: string;
}

@Component({
  selector: 'app-crud-usuario',
  imports: [FormsModule],
  templateUrl: './crud-usuario.html',
  styleUrl: './crud-usuario.css',
})
export class CrudUsuario implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost/ServicioUsuario/';

  protected readonly lista = signal<Usuario[]>([]);
  protected mostrandoModal = false;
  protected modoEditar = false;
  protected enviado = false;
  protected form = this.formVacio();

  ngOnInit() { this.loadUsuarios(); }

  protected loadUsuarios() {
    this.http.get<Usuario[]>(this.apiUrl + 'ReadAll').subscribe({
      next: (data) => this.lista.set(data),
      error: (err) => console.error('Error loading usuarios', err),
    });
  }

  protected formVacio() {
    return { nombreUsuario: '', correo: '', contrasena: '', rol: '', empleadoId: null, estado: '' };
  }

  protected formValido(): boolean {
    return this.form.nombreUsuario !== '' && this.form.correo !== '' && this.form.rol !== '' && this.form.estado !== '';
  }

  protected abrirCrear() { this.form = this.formVacio(); this.enviado = false; this.modoEditar = false; this.mostrandoModal = true; }
  protected abrirEditar(item: Usuario) { this.form = { ...item, contrasena: '' }; this.enviado = false; this.modoEditar = true; this.mostrandoModal = true; }
  protected cerrarModal() { this.mostrandoModal = false; this.enviado = false; }

  protected guardar() {
    this.enviado = true;
    if (!this.formValido()) return;
    if (this.modoEditar) {
      this.http.post(this.apiUrl + 'Update', this.form).subscribe({
        next: () => { this.loadUsuarios(); this.cerrarModal(); },
        error: (err) => console.error('Error updating usuario', err),
      });
    } else {
      this.http.post(this.apiUrl + 'Create', this.form).subscribe({
        next: () => { this.loadUsuarios(); this.cerrarModal(); },
        error: (err) => console.error('Error creating usuario', err),
      });
    }
  }

  protected eliminar(id: number) {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.http.post(this.apiUrl + 'Delete', { id }).subscribe({
        next: () => this.loadUsuarios(),
        error: (err) => console.error('Error deleting usuario', err),
      });
    }
  }
}
