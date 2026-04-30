import { Injectable, signal } from '@angular/core';

export interface Notif {
  mensaje: string;
  tipo: 'exito' | 'error';
}

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  readonly notif = signal<Notif | null>(null);

  mostrar(mensaje: string, tipo: 'exito' | 'error' = 'exito') {
    this.notif.set({ mensaje, tipo });
    setTimeout(() => this.notif.set(null), 3500);
  }
}
