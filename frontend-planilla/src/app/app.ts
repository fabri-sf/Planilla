import { Component, HostListener, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend-planilla');

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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.hamburger-wrapper')) {
      this.menuOpen = false;
    }
  }
}