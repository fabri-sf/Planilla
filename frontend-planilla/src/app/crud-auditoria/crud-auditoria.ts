import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface Auditoria {
  id: number;
  usuarioId: number;
  tabla: string;
  operacion: string;
  registroId: number;
  campoModificado: string;
  valorAnterior: string;
  valorNuevo: string;
  descripcion: string;
  fechaOperacion: string;
}

@Component({
  selector: 'app-crud-auditoria',
  imports: [],
  templateUrl: './crud-auditoria.html',
  styleUrl: './crud-auditoria.css',
})
export class CrudAuditoria implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = 'http://localhost/ServicioAuditoria/';

  protected readonly lista = signal<Auditoria[]>([]);

  ngOnInit() { this.loadAuditoria(); }

  protected loadAuditoria() {
    this.http.get<Auditoria[]>(this.apiUrl + 'ReadAll').subscribe({
      next: (data) => this.lista.set(data),
      error: (err) => console.error('Error loading auditoria', err),
    });
  }
  cerrar() { this.router.navigate(['/']); }
}