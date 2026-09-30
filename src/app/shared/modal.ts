import { AfterViewInit, Component, ElementRef, OnDestroy, inject, input, output } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    <div class="modal-fondo" (click)="cerrar.emit()">
      <div class="modal-caja" [class]="'ancho-' + ancho()" role="dialog" aria-modal="true"
           [attr.aria-label]="titulo()" tabindex="-1" (click)="$event.stopPropagation()"
           (keydown.escape)="cerrar.emit()">
        <header class="modal-cab">
          <h2>{{ titulo() }}</h2>
          <button type="button" class="icono-cerrar" aria-label="Cerrar" (click)="cerrar.emit()">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </header>
        <div class="modal-cuerpo"><ng-content /></div>
        <footer class="modal-pie"><ng-content select="[pie]" /></footer>
      </div>
    </div>
  `,
})
export class Modal implements AfterViewInit, OnDestroy {
  titulo = input('');
  ancho = input<'sm' | 'md' | 'lg'>('md');
  cerrar = output<void>();

  private doc = inject(DOCUMENT);
  private el = inject(ElementRef<HTMLElement>);

  ngAfterViewInit() {
    this.doc.body.classList.add('sin-scroll');
    (this.el.nativeElement.querySelector('.modal-caja') as HTMLElement | null)?.focus();
  }

  ngOnDestroy() {
    this.doc.body.classList.remove('sin-scroll');
  }
}
