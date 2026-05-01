import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NotificacionService } from './notificacion.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend-planilla');
  protected readonly notifSvc = inject(NotificacionService);

  menuOpen = false;
  rutaActiva = '';

  constructor(public router: Router) {}

  navegarOToggle(ruta: string) {
    if (this.rutaActiva === ruta) {
      this.rutaActiva = '';
      this.router.navigate(['/']);
    } else {
      this.rutaActiva = ruta;
      this.router.navigate([ruta]);
    }
    this.menuOpen = false;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  irAPlanilla() { this.router.navigate(['/planilla']); }
  irAEmpleados() { this.router.navigate(['/empleado']); }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.hamburger-wrapper')) {
      this.menuOpen = false;
    }
  }
}