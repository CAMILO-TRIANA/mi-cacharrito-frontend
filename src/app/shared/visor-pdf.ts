import { Component, OnDestroy, OnInit, inject, input, output, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

import { AlquilerService } from '../servicios/alquiler';
import { Modal } from './modal';

// Muestra el PDF del alquiler dentro de un modal, con boton para descargarlo
@Component({
  selector: 'app-visor-pdf',
  standalone: true,
  imports: [Modal],
  template: `
    <app-modal [titulo]="'Comprobante ' + numero()" ancho="lg" (cerrar)="cerrar.emit()">
      @if (cargando()) {
        <p class="estado-carga">Generando comprobante…</p>
      } @else if (fallo()) {
        <p class="aviso aviso-error">No se pudo generar el comprobante. Intente de nuevo.</p>
      } @else {
        <iframe class="visor-pdf" [src]="urlIframe()!" title="Comprobante de alquiler"></iframe>
      }
      <div pie>
        @if (urlDescarga()) {
          <a class="btn btn-borde" [href]="urlDescarga()!" [download]="numero() + '.pdf'">Descargar PDF</a>
        }
        <button type="button" class="btn btn-primario" (click)="cerrar.emit()">Cerrar</button>
      </div>
    </app-modal>
  `,
})
export class VisorPdf implements OnInit, OnDestroy {
  numero = input.required<string>();
  cerrar = output<void>();

  cargando = signal(true);
  fallo = signal(false);
  urlIframe = signal<SafeResourceUrl | null>(null);
  urlDescarga = signal<SafeUrl | null>(null);

  private servicio = inject(AlquilerService);
  private sanitizer = inject(DomSanitizer);
  private blobUrl = '';

  ngOnInit() {
    this.servicio.generarPdf(this.numero()).subscribe({
      next: (blob) => {
        this.blobUrl = URL.createObjectURL(blob);
        this.urlIframe.set(this.sanitizer.bypassSecurityTrustResourceUrl(this.blobUrl));
        this.urlDescarga.set(this.sanitizer.bypassSecurityTrustUrl(this.blobUrl));
        this.cargando.set(false);
      },
      error: () => {
        this.fallo.set(true);
        this.cargando.set(false);
      },
    });
  }

  ngOnDestroy() {
    if (this.blobUrl) URL.revokeObjectURL(this.blobUrl);
  }
}
