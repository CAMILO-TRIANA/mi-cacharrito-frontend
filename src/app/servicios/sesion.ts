import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const CLAVE = 'cacharrito.sesion';

@Injectable({
  providedIn: 'root'
})
export class SesionService {
  private enNavegador = isPlatformBrowser(inject(PLATFORM_ID));

  // Guarda al usuario o administrador que inicio sesion para usarlo en los demas componentes
  usuarioSignal = signal<any | null>(null);
  administradorSignal = signal<any | null>(null);

  constructor() {
    // Recupera la sesion al refrescar la pagina (dura mientras la pestaña este abierta)
    if (!this.enNavegador) return;
    try {
      const guardada = sessionStorage.getItem(CLAVE);
      if (!guardada) return;
      const s = JSON.parse(guardada);
      if (s.tipo === 'usuario') this.usuarioSignal.set(s.datos);
      if (s.tipo === 'administrador') this.administradorSignal.set(s.datos);
    } catch {
      sessionStorage.removeItem(CLAVE);
    }
  }

  private persistir(tipo: 'usuario' | 'administrador', datos: any) {
    if (this.enNavegador) sessionStorage.setItem(CLAVE, JSON.stringify({ tipo, datos }));
  }

  iniciarSesionUsuario(usuario: any) {
    this.usuarioSignal.set(usuario);
    this.administradorSignal.set(null);
    this.persistir('usuario', usuario);
  }

  iniciarSesionAdministrador(administrador: any) {
    this.administradorSignal.set(administrador);
    this.usuarioSignal.set(null);
    this.persistir('administrador', administrador);
  }

  cerrarSesion() {
    this.usuarioSignal.set(null);
    this.administradorSignal.set(null);
    if (this.enNavegador) sessionStorage.removeItem(CLAVE);
  }
}
