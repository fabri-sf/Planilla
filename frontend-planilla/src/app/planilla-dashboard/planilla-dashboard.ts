import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgStyle } from '@angular/common';
import { Router } from '@angular/router';

interface Planilla {
  id: number; periodo: string; fechaInicio: string; fechaFin: string;
  fechaPago: string; estado: string; descripcion: string;
  creadoPor: number; aprobadoPor: number; creacion: string;
}
interface Usuario { id: number; nombreUsuario: string; rol: string; }

@Component({
  selector: 'app-planilla-dashboard',
  standalone: true,
  imports: [FormsModule, NgStyle],
  templateUrl: './planilla-dashboard.html',
  styleUrl: './planilla-dashboard.css',
})
export class PlanillaDashboard implements OnInit {
  private readonly http    = inject(HttpClient);
  private readonly router  = inject(Router);

  protected readonly lista    = signal<Planilla[]>([]);
  protected readonly usuarios = signal<Usuario[]>([]);
  protected filtroActivo = '';

  readonly columnas = [
    { estado: 'borrador',  label: 'Borrador',  color: '#6b7280', bg: '#f3f4f6', borde: '#9ca3af' },
    { estado: 'procesada', label: 'Procesada', color: '#1d4ed8', bg: '#eff6ff', borde: '#3b82f6' },
    { estado: 'aprobada',  label: 'Aprobada',  color: '#92400e', bg: '#fffbeb', borde: '#f59e0b' },
    { estado: 'pagada',    label: 'Pagada',    color: '#065f46', bg: '#f0fdf4', borde: '#22c55e' },
    { estado: 'cerrada',   label: 'Cerrada',   color: '#5b21b6', bg: '#faf5ff', borde: '#a855f7' },
    { estado: 'atrasada',  label: 'Atrasada',  color: '#991b1b', bg: '#fef2f2', borde: '#ef4444' },
  ];

  ngOnInit() {
    this.loadPlanillas();
    this.http.get<Usuario[]>('http://localhost/ServicioUsuario/ReadAll').subscribe({
      next: (d) => this.usuarios.set(d), error: () => {}
    });
  }

  protected loadPlanillas() {
    this.http.get<Planilla[]>('http://localhost/ServicioPlanilla/ReadAll').subscribe({
      next: (d) => this.lista.set(d), error: () => {}
    });
  }

  protected planillasPorEstado(estado: string): Planilla[] {
    return this.lista().filter(p => p.estado === estado);
  }

  protected get columnasVisibles() {
    return this.filtroActivo
      ? this.columnas.filter(c => c.estado === this.filtroActivo)
      : this.columnas;
  }

  protected get totalPendientes(): number {
    return this.lista().filter(p => ['borrador','procesada','aprobada','atrasada'].includes(p.estado)).length;
  }
  protected get totalEnProceso(): number {
    return this.lista().filter(p => ['procesada','aprobada'].includes(p.estado)).length;
  }

  protected nombreUsuario(id: number): string {
    return this.usuarios().find(u => u.id === id)?.nombreUsuario ?? '—';
  }
  protected inicialUsuario(id: number): string {
    const u = this.usuarios().find(u => u.id === id);
    return u ? u.nombreUsuario.charAt(0).toUpperCase() : '?';
  }

  protected badgeStyle(estado: string): { background: string; color: string; border: string } {
    const col = this.columnas.find(c => c.estado === estado);
    return col
      ? { background: col.bg, color: col.color, border: `1px solid ${col.borde}` }
      : { background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' };
  }

  protected navCrear() { this.router.navigate(['/planilla/crear']); }
  protected navDetalle(id: number) { this.router.navigate(['/planilla', id]); }

  protected fmtFecha(val: string): string {
    if (!val) return '—';
    return val.split('T')[0];
  }
}
