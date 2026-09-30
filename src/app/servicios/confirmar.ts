import { Injectable, signal } from '@angular/core';

export interface OpcionesConfirmar {
  titulo: string;
  mensaje: string;
  textoOk?: string;
  peligro?: boolean;
}

// Reemplaza a confirm(): abre un modal y devuelve true/false segun lo que elija la persona
@Injectable({
  providedIn: 'root'
})
export class ConfirmarService {
  estado = signal<(OpcionesConfirmar & { resolver: (v: boolean) => void }) | null>(null);

  pedir(opciones: OpcionesConfirmar): Promise<boolean> {
    return new Promise((resolver) => this.estado.set({ ...opciones, resolver }));
  }

  responder(valor: boolean) {
    const actual = this.estado();
    this.estado.set(null);
    actual?.resolver(valor);
  }
}
