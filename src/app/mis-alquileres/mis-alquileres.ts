import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AlquilerService } from '../servicios/alquiler';
import { SesionService } from '../servicios/sesion';
import { NotificacionService } from '../servicios/notificacion';
import { ConfirmarService } from '../servicios/confirmar';
import { Foto } from '../shared/foto';
import { Placa } from '../shared/placa';
import { VisorPdf } from '../shared/visor-pdf';
import { CopPipe, FechaPipe, diasEntre } from '../util/formato';
import { mensajeError } from '../util/errores';
import { ESTADOS_ALQUILER, tituloVehiculo } from '../util/vehiculo-util';

@Component({
  selector: 'app-mis-alquileres',
  standalone: true,
  imports: [RouterLink, Foto, Placa, VisorPdf, CopPipe, FechaPipe],
  templateUrl: './mis-alquileres.html',
  styleUrl: './mis-alquileres.css',
})
export class MisAlquileres implements OnInit {
  lista = signal<any[]>([]);
  cargando = signal(true);
  filtro = signal<'todos' | 'activos' | 'historial'>('todos');
  pdfNumero = signal<string | null>(null);
  usuario: any = null;

  titulo = tituloVehiculo;
  estados = ESTADOS_ALQUILER;

  private esActivo = (a: any) => a.estado === 'pendiente de entrega' || a.estado === 'entregado';

  visibles = computed(() => {
    const f = this.filtro();
    return this.lista().filter((a) => f === 'todos' || (f === 'activos' ? this.esActivo(a) : !this.esActivo(a)));
  });
  activos = computed(() => this.lista().filter(this.esActivo).length);

  constructor(
    private servicioAlquiler: AlquilerService,
    private sesion: SesionService,
    private notificacion: NotificacionService,
    private confirmar: ConfirmarService
  ) {}

  ngOnInit(): void {
    this.usuario = this.sesion.usuarioSignal();
    this.obtenerAlquileres();
  }

  obtenerAlquileres() {
    this.cargando.set(true);
    this.servicioAlquiler.listarPorUsuario(this.usuario.id).subscribe({
      next: (dato) => {
        this.lista.set(dato);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.notificacion.error(mensajeError(err));
      },
    });
  }

  dias(a: any): number {
    return Math.max(1, diasEntre(a.fechaInicio, a.fechaEntregaPactada));
  }

  async cancelar(a: any) {
    const ok = await this.confirmar.pedir({
      titulo: 'Cancelar alquiler',
      mensaje: `Vas a cancelar el alquiler ${a.numeroAlquiler} de ${tituloVehiculo(a.vehiculo)} (${a.vehiculo.placa}). El vehículo quedará disponible para otras personas.`,
      textoOk: 'Sí, cancelar alquiler',
      peligro: true,
    });
    if (!ok) return;
    this.servicioAlquiler.cancelarAlquiler(a.numeroAlquiler).subscribe({
      next: () => {
        this.notificacion.ok(`Alquiler ${a.numeroAlquiler} cancelado`);
        this.obtenerAlquileres();
      },
      error: (err) => {
        this.notificacion.error(mensajeError(err));
        this.obtenerAlquileres();
      },
    });
  }
}
