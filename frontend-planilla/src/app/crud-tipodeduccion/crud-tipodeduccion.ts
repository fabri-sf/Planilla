import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface TipoDeduccion {
  id: number; codigo: string; nombre: string; porcentaje: number;
  montoFijo: number; obligatorio: boolean; estado: string; creacion: string;
}

@Component({
  selector: 'app-crud-tipodeduccion',
  imports: [FormsModule],
  templateUrl: './crud-tipodeduccion.html',
  styleUrl: './crud-tipodeduccion.css',
})
export class CrudTipodeduccion implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost/ServicioTipoDeduccion/';

  protected readonly lista = signal<TipoDeduccion[]>([]);
  protected mostrandoModal = false;
  protected modoEditar = false;
  protected enviado = false;
  protected form = this.formVacio();

  ngOnInit() { this.loadTiposDeducciones(); }

  protected loadTiposDeducciones() {
    this.http.get<TipoDeduccion[]>(this.apiUrl + 'ReadAll').subscribe({
      next: (data) => this.lista.set(data),
      error: (err) => console.error('Error loading tipos de deduccion', err),
    });
  }

  protected formVacio() {
    return { codigo: '', nombre: '', porcentaje: 0, montoFijo: 0, obligatorio: false, estado: '' };
  }

  protected formValido(): boolean {
    return this.form.codigo !== '' && this.form.nombre !== '' && this.form.estado !== '';
  }

  protected abrirCrear() { this.form = this.formVacio(); this.enviado = false; this.modoEditar = false; this.mostrandoModal = true; }
  protected abrirEditar(item: TipoDeduccion) { this.form = { ...item }; this.enviado = false; this.modoEditar = true; this.mostrandoModal = true; }
  protected cerrarModal() { this.mostrandoModal = false; this.enviado = false; }

  protected guardar() {
    this.enviado = true;
    if (!this.formValido()) return;
    if (this.modoEditar) {
      this.http.post(this.apiUrl + 'Update', this.form).subscribe({
        next: () => { this.loadTiposDeducciones(); this.cerrarModal(); },
        error: (err) => console.error('Error updating tipo deduccion', err),
      });
    } else {
      this.http.post(this.apiUrl + 'Create', this.form).subscribe({
        next: () => { this.loadTiposDeducciones(); this.cerrarModal(); },
        error: (err) => console.error('Error creating tipo deduccion', err),
      });
    }
  }

  protected eliminar(id: number) {
    if (confirm('¿Estás seguro de eliminar este tipo de deducción?')) {
      this.http.post(this.apiUrl + 'Delete', { id }).subscribe({
        next: () => this.loadTiposDeducciones(),
        error: (err) => console.error('Error deleting tipo deduccion', err),
      });
    }
  }
}
