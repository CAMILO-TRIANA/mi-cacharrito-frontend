import { Component, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';

import { SesionService } from '../servicios/sesion';

@Component({
  selector: 'app-navegacion',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navegacion.html',
  styleUrl: './navegacion.css',
})
export class Navegacion {
  usuario;
  administrador;
  menuAbierto = signal(false);

  nombre = computed(() => this.usuario()?.nombreCompleto ?? this.administrador()?.nombre ?? '');
  iniciales = computed(() =>
    this.nombre().split(' ').filter(Boolean).slice(0, 2).map((p: string) => p[0]).join('').toUpperCase()
  );

  constructor(private sesion: SesionService, private router: Router) {
    this.usuario = this.sesion.usuarioSignal;
    this.administrador = this.sesion.administradorSignal;
  }

  cerrarSesion() {
    this.menuAbierto.set(false);
    this.sesion.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
