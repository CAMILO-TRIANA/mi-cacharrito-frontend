import { Component, inject } from '@angular/core';

import { NotificacionService } from '../servicios/notificacion';

@Component({
  selector: 'app-toasts',
  standalone: true,
  template: `
    <div class="toasts" aria-live="polite">
      @for (a of notificacion.avisos(); track a.id) {
        <div class="toast" [class]="'toast-' + a.tipo" role="status">
          <span>{{ a.texto }}</span>
          <button type="button" aria-label="Cerrar aviso" (click)="notificacion.quitar(a.id)">×</button>
        </div>
      }
    </div>
  `,
})
export class Toasts {
  notificacion = inject(NotificacionService);
}
