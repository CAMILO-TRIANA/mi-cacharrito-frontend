import { Component, inject } from '@angular/core';

import { ConfirmarService } from '../servicios/confirmar';
import { Modal } from './modal';

@Component({
  selector: 'app-confirmar',
  standalone: true,
  imports: [Modal],
  template: `
    @if (servicio.estado(); as e) {
      <app-modal [titulo]="e.titulo" ancho="sm" (cerrar)="servicio.responder(false)">
        <p class="texto-modal">{{ e.mensaje }}</p>
        <div pie>
          <button type="button" class="btn btn-borde" (click)="servicio.responder(false)">Volver</button>
          <button type="button" class="btn" [class.btn-peligro]="e.peligro" [class.btn-primario]="!e.peligro"
                  (click)="servicio.responder(true)">{{ e.textoOk || 'Confirmar' }}</button>
        </div>
      </app-modal>
    }
  `,
})
export class Confirmar {
  servicio = inject(ConfirmarService);
}
