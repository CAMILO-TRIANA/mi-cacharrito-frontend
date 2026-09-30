import { Component, computed, input, signal } from '@angular/core';

import { imagenDe, placeholderDe, tituloVehiculo } from '../util/vehiculo-util';

// Foto del vehiculo; si la imagen falla (o no existe) muestra la ilustracion de su tipo
@Component({
  selector: 'app-foto',
  standalone: true,
  template: `<img [src]="src()" [alt]="alt()" loading="lazy" (error)="roto.set(true)" />`,
  styles: [':host{display:block;width:100%;height:100%} img{width:100%;height:100%;object-fit:cover;display:block}'],
})
export class Foto {
  v = input<any>();
  roto = signal(false);
  src = computed(() => (this.roto() ? placeholderDe(this.v()) : imagenDe(this.v())));
  alt = computed(() => tituloVehiculo(this.v()));
}
