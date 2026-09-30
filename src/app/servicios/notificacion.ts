import { Injectable, signal } from '@angular/core';

export interface Aviso {
  id: number;
  tipo: 'ok' | 'error' | 'info';
  texto: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  avisos = signal<Aviso[]>([]);
  private contador = 0;

  ok(texto: string) { this.mostrar('ok', texto); }
  error(texto: string) { this.mostrar('error', texto, 6000); }
  info(texto: string) { this.mostrar('info', texto); }

  quitar(id: number) {
    this.avisos.update((lista) => lista.filter((a) => a.id !== id));
  }

  private mostrar(tipo: Aviso['tipo'], texto: string, ms = 4000) {
    const id = ++this.contador;
    this.avisos.update((lista) => [...lista, { id, tipo, texto }]);
    setTimeout(() => this.quitar(id), ms);
  }
}
