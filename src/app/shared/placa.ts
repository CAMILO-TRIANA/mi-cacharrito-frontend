import { Component, input } from '@angular/core';

// La placa colombiana (amarilla) identifica cada vehiculo en toda la app
@Component({
  selector: 'app-placa',
  standalone: true,
  template: `<span class="placa" [class.placa-lg]="grande()" [attr.aria-label]="'Placa ' + placa()"><small aria-hidden="true">COLOMBIA</small><b>{{ placa() }}</b></span>`,
})
export class Placa {
  placa = input<string>('');
  grande = input(false);
}
