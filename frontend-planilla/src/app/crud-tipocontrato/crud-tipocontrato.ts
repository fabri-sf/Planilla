import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface TipoContrato {
  id: number; nombre: string; horasSemanales: number;
  descripcion: string; estado: string; creacion: string;
}

@Component({
  selector: 'app-crud-tipocontrato',
  imports: [FormsModule],
  templateUrl: './crud-tipocontrato.html',
  styleUrl: './crud-tipocontrato.css',
})
export class CrudTipocontrato implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost/ServicioTipoContrato/';

  protected readonly lista = signal<TipoContrato[]>([]);
  protected mostrandoModal = false;
  protected modoEditar = false;
  protected enviado = false;
  protected form = this.formVacio();

  ngOnInit() { this.loadTiposContrato(); }

  protected loadTiposContrato() {
    this.http.get<TipoContrato[]>(this.apiUrl + 'ReadAll').subscribe({
      next: (data) => this.lista.set(data),
      error: (err) => console.error('Error loading tipos de contrato', err),
    });
  }

  protected formVacio() {
    return { nombre: '', horasSemanales: 0, descripcion: '', estado: '' };
  }

  protected formValido(): boolean {
    return this.form.nombre !== '' && this.form.horasSemanales > 0 && this.form.estado !== '';
  }

  protected abrirCrear() { this.form = this.formVacio(); this.enviado = false; this.modoEditar = false; this.mostrandoModal = true; }
  protected abrirEditar(item: TipoContrato) { this.form = { ...item }; this.enviado = false; this.modoEditar = true; this.mostrandoModal = true; }
  protected cerrarModal() { this.mostrandoModal = false; this.enviado = false; }

  protected guardar() {
    this.enviado = true;
    if (!this.formValido()) return;
    if (this.modoEditar) {
      this.http.post(this.apiUrl + 'Update', this.form).subscribe({
        next: () => { this.loadTiposContrato(); this.cerrarModal(); },
        error: (err) => console.error('Error updating tipo contrato', err),
      });
    } else {
      this.http.post(this.apiUrl + 'Create', this.form).subscribe({
        next: () => { this.loadTiposContrato(); this.cerrarModal(); },
        error: (err) => console.error('Error creating tipo contrato', err),
      });
    }
  }

  protected eliminar(id: number) {
    if (confirm('¿Estás seguro de eliminar este tipo de contrato?')) {
      this.http.post(this.apiUrl + 'Delete', { id }).subscribe({
        next: () => this.loadTiposContrato(),
        error: (err) => console.error('Error deleting tipo contrato', err),
      });
    }
  }
}
