import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
export class CrudTipobonificacion implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost/ServicioTipoBonificacion/';

  protected readonly lista = signal<TipoBonificacion[]>([]);
  protected mostrandoModal = false;
  protected modoEditar = false;
  protected enviado = false;
  protected form = this.formVacio();

  ngOnInit() { this.loadTiposBonificaciones(); }

  protected loadTiposBonificaciones() {
    this.http.get<TipoBonificacion[]>(this.apiUrl + 'ReadAll').subscribe({
      next: (data) => this.lista.set(data),
      error: (err) => console.error('Error loading tipos de bonificacion', err),
    });
  }

  protected formVacio() {
    return { codigo: '', nombre: '', descripcion: '', estado: '' };
  }

  protected formValido(): boolean {
    return this.form.codigo !== '' && this.form.nombre !== '' && this.form.estado !== '';
  }

  protected abrirCrear() { this.form = this.formVacio(); this.enviado = false; this.modoEditar = false; this.mostrandoModal = true; }
  protected abrirEditar(item: TipoBonificacion) { this.form = { ...item }; this.enviado = false; this.modoEditar = true; this.mostrandoModal = true; }
  protected cerrarModal() { this.mostrandoModal = false; this.enviado = false; }

  protected guardar() {
    this.enviado = true;
    if (!this.formValido()) return;
    if (this.modoEditar) {
      this.http.post(this.apiUrl + 'Update', this.form).subscribe({
        next: () => { this.loadTiposBonificaciones(); this.cerrarModal(); },
        error: (err) => console.error('Error updating tipo bonificacion', err),
      });
    } else {
      this.http.post(this.apiUrl + 'Create', this.form).subscribe({
        next: () => { this.loadTiposBonificaciones(); this.cerrarModal(); },
        error: (err) => console.error('Error creating tipo bonificacion', err),
      });
    }
  }

  protected eliminar(id: number) {
    if (confirm('¿Estás seguro de eliminar este tipo de bonificación?')) {
      this.http.post(this.apiUrl + 'Delete', { id }).subscribe({
        next: () => this.loadTiposBonificaciones(),
        error: (err) => console.error('Error deleting tipo bonificacion', err),
      });
    }
  }
}
