import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificacionService } from '../notificacion.service';

interface Planilla {
  id: number; periodo: string; fechaInicio: string; fechaFin: string;
  fechaPago: string; estado: string; descripcion: string;
}

@Component({
  selector: 'app-planilla-atraso',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './planilla-atraso.html',
  styleUrl: './planilla-atraso.css',
})
export class PlanillaAtraso implements OnInit {
  private readonly http     = inject(HttpClient);
  private readonly router   = inject(Router);
  private readonly route    = inject(ActivatedRoute);
  private readonly notifSvc = inject(NotificacionService);

  protected planillaId = 0;
  protected readonly planilla = signal<Planilla | null>(null);

  protected form = {
    motivo: '',
    nuevaFecha: '',
    observaciones: '',
  };

  protected enviado  = false;
  protected guardando = false;

  protected readonly MOTIVOS = [
    'Problemas de liquidez',
    'Error en cálculo de pagos',
    'Falta de aprobación gerencial',
    'Cierre contable pendiente',
    'Fuerza mayor',
    'Otro',
  ];

  ngOnInit() {
    this.planillaId = Number(this.route.snapshot.paramMap.get('id'));
    this.http.get<Planilla[]>('http://localhost/ServicioPlanilla/ReadAll').subscribe({
      next: (list) => {
        const p = list.find(x => x.id === this.planillaId);
        if (p) this.planilla.set(p);
      },
      error: () => {},
    });
  }

  protected fmtFecha(val: string): string { return val ? val.split('T')[0] : '—'; }

  protected formValido(): boolean {
    return !!this.form.motivo && !!this.form.nuevaFecha;
  }

  protected guardar() {
    this.enviado = true;
    if (!this.formValido()) return;
    this.guardando = true;

    const payload = {
      planillaId: this.planillaId,
      motivo: this.form.motivo,
      nuevaFechaPago: this.form.nuevaFecha,
      observaciones: this.form.observaciones,
    };

    this.http.post('http://localhost/ServicioPlanilla/Atraso', payload).subscribe({
      next: () => {
        this.notifSvc.mostrar('Planilla marcada como atrasada');
        this.router.navigate(['/planilla', this.planillaId]);
      },
      error: (e) => {
        this.guardando = false;
        this.notifSvc.mostrar(e.error?.error ?? 'Error al registrar atraso', 'error');
      },
    });
  }

  protected volver() { this.router.navigate(['/planilla', this.planillaId]); }
}
