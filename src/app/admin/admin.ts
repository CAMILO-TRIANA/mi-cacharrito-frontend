import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, of, switchMap } from 'rxjs';

import { AlquilerService } from '../servicios/alquiler';
import { VehiculoService } from '../servicios/vehiculo';
import { SesionService } from '../servicios/sesion';
import { NotificacionService } from '../servicios/notificacion';
import { ConfirmarService } from '../servicios/confirmar';
import { Modal } from '../shared/modal';
import { Foto } from '../shared/foto';
import { Placa } from '../shared/placa';
import { VisorPdf } from '../shared/visor-pdf';
import { CopPipe, FechaPipe, diasEntre, hoyISO } from '../util/formato';
import { mensajeError } from '../util/errores';
import {
  ESTADOS_ALQUILER, ESTADOS_VEHICULO, TIPOS, colorHex, etiquetaTipo, imagenDe, tituloVehiculo,
} from '../util/vehiculo-util';

type Pestana = 'entregas' | 'recepcion' | 'flota' | 'historial';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, Modal, Foto, Placa, VisorPdf, CopPipe, FechaPipe],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  administrador: any = null;
  cargando = signal(true);
  pestana = signal<Pestana>('entregas');

  alquileres = signal<any[]>([]);
  flota = signal<any[]>([]);

  // Ayudas para la plantilla
  titulo = tituloVehiculo;
  etiquetaTipo = etiquetaTipo;
  colorHex = colorHex;
  tipos = TIPOS;
  estadosAlquiler = ESTADOS_ALQUILER;
  estadosVehiculo = ESTADOS_VEHICULO;
  hoy = hoyISO();

  // ---- Resumen ----
  pendientes = computed(() => this.alquileres().filter((a) => a.estado === 'pendiente de entrega'));
  enCurso = computed(() => this.alquileres().filter((a) => a.estado === 'entregado'));
  disponibles = computed(() => this.flota().filter((v) => v.estado === 'disponible').length);

  // ---- Entregas (buscar por placa) ----
  filtroEntregas = signal('');
  pendientesFiltrados = computed(() => {
    const q = this.filtroEntregas().trim().toLowerCase();
    return this.pendientes().filter(
      (a) => !q || `${a.vehiculo?.placa} ${a.numeroAlquiler} ${a.usuario?.nombreCompleto} ${a.usuario?.numeroIdentificacion}`.toLowerCase().includes(q)
    );
  });

  // ---- Recepcion (buscar por numero de alquiler) ----
  numeroBuscar: string = '';
  encontrado = signal<any | null>(null);
  buscado = signal(false);
  fechaReal: string = hoyISO();

  // ---- Vehiculos ----
  tipoFlota = signal<string>('todos');
  estadoFlota = signal<string>('disponible');
  flotaFiltrada = computed(() =>
    this.flota().filter(
      (v) =>
        (this.tipoFlota() === 'todos' || v.tipoVehiculo === this.tipoFlota()) &&
        (this.estadoFlota() === 'todos' || v.estado === this.estadoFlota())
    )
  );
  conteoFlota = computed(() => {
    const c: Record<string, number> = { todos: this.flota().length };
    for (const v of this.flota()) c[v.tipoVehiculo] = (c[v.tipoVehiculo] ?? 0) + 1;
    return c;
  });

  formAbierto = signal(false);
  guardando = signal(false);
  errorForm = signal('');
  form: any = {};
  archivo: File | null = null;
  previa = signal<string | null>(null);

  // ---- Historial ----
  filtroEstado = signal<string>('todos');
  filtroTexto = signal('');
  historial = computed(() => {
    const q = this.filtroTexto().trim().toLowerCase();
    return this.alquileres().filter(
      (a) =>
        (this.filtroEstado() === 'todos' || a.estado === this.filtroEstado()) &&
        (!q || `${a.vehiculo?.placa} ${a.numeroAlquiler} ${a.usuario?.nombreCompleto}`.toLowerCase().includes(q))
    );
  });

  pdfNumero = signal<string | null>(null);

  constructor(
    private servicioAlquiler: AlquilerService,
    private servicioVehiculo: VehiculoService,
    private sesion: SesionService,
    private notificacion: NotificacionService,
    private confirmar: ConfirmarService
  ) {}

  ngOnInit(): void {
    this.administrador = this.sesion.administradorSignal();
    this.cargar();
  }

  cargar() {
    this.servicioAlquiler.listarAlquileres().subscribe({
      next: (dato) => { this.alquileres.set(dato); this.cargando.set(false); },
      error: (err) => { this.cargando.set(false); this.notificacion.error(mensajeError(err)); },
    });
    this.servicioVehiculo.listarVehiculos().subscribe({
      next: (dato) => this.flota.set(dato),
      error: (err) => this.notificacion.error(mensajeError(err)),
    });
  }

  // ================= Entregas =================
  async entregar(a: any) {
    const ok = await this.confirmar.pedir({
      titulo: 'Entregar vehículo',
      mensaje: `Vas a entregar el vehículo ${a.vehiculo.placa} a ${a.usuario.nombreCompleto} (C.C. ${a.usuario.numeroIdentificacion}). El alquiler pasará a "entregado".`,
      textoOk: 'Sí, entregar',
    });
    if (!ok) return;
    this.servicioAlquiler.marcarEntregado(a.vehiculo.placa, this.administrador.id).subscribe({
      next: () => {
        this.notificacion.ok(`Vehículo ${a.vehiculo.placa} entregado a ${a.usuario.nombreCompleto}`);
        this.cargar();
      },
      error: (err) => this.notificacion.error(mensajeError(err)),
    });
  }

  // ================= Recepcion =================
  buscarAlquiler() {
    const n = this.numeroBuscar.trim();
    if (!n) return;
    this.servicioAlquiler.buscarPorNumero(n).subscribe({
      next: (a) => {
        this.encontrado.set(a);
        this.buscado.set(true);
        this.fechaReal = this.hoy;
      },
      error: (err) => this.notificacion.error(mensajeError(err)),
    });
  }

  recibirDe(a: any) {
    this.numeroBuscar = a.numeroAlquiler;
    this.pestana.set('recepcion');
    this.buscarAlquiler();
  }

  diasRetraso(): number {
    const a = this.encontrado();
    return a && this.fechaReal ? Math.max(0, diasEntre(a.fechaEntregaPactada, this.fechaReal)) : 0;
  }
  recargo(): number {
    return this.diasRetraso() * (this.encontrado()?.vehiculo?.valorDia ?? 0);
  }
  totalFinal(): number {
    return (this.encontrado()?.valorTotal ?? 0) + this.recargo();
  }
  fechaRealInvalida(): boolean {
    const a = this.encontrado();
    return !this.fechaReal || (!!a && this.fechaReal < a.fechaInicio);
  }

  async recibir() {
    const a = this.encontrado();
    if (!a || this.fechaRealInvalida()) return;
    const ok = await this.confirmar.pedir({
      titulo: 'Registrar devolución',
      mensaje:
        `El vehículo ${a.vehiculo.placa} quedará disponible de nuevo. ` +
        (this.diasRetraso() > 0
          ? `Hay ${this.diasRetraso()} día(s) de retraso: se cobrará un recargo de ${this.recargo().toLocaleString('es-CO')} COP.`
          : 'La devolución es a tiempo, sin recargo.'),
      textoOk: 'Registrar devolución',
    });
    if (!ok) return;
    this.servicioAlquiler.marcarDisponible(a.numeroAlquiler, this.fechaReal, this.administrador.id).subscribe({
      next: (dato) => {
        this.notificacion.ok(`Vehículo ${a.vehiculo.placa} disponible. Valor final: ${Number(dato.valorTotal).toLocaleString('es-CO')} COP`);
        this.encontrado.set(null);
        this.buscado.set(false);
        this.numeroBuscar = '';
        this.cargar();
      },
      error: (err) => this.notificacion.error(mensajeError(err)),
    });
  }

  // ================= Vehiculos =================
  nuevoVehiculo() {
    this.form = { placa: '', tipoVehiculo: 'automovil', marca: '', modelo: '', anio: null, color: '', pasajeros: null, transmision: 'Manual', valorDia: null, estado: 'disponible', imagenUrl: '' };
    this.abrirForm();
  }

  editarVehiculo(v: any) {
    this.form = { ...v };
    this.abrirForm();
  }

  private abrirForm() {
    this.archivo = null;
    this.previa.set(null);
    this.errorForm.set('');
    this.formAbierto.set(true);
  }

  cerrarForm() {
    this.formAbierto.set(false);
  }

  elegirArchivo(evento: Event) {
    const archivo = (evento.target as HTMLInputElement).files?.[0] ?? null;
    if (archivo && archivo.size > 5 * 1024 * 1024) {
      this.errorForm.set('La foto pesa más de 5 MB. Elige una más liviana.');
      return;
    }
    this.errorForm.set('');
    this.archivo = archivo;
    this.previa.set(archivo ? URL.createObjectURL(archivo) : null);
  }

  imagenActual(): string {
    return this.previa() ?? imagenDe(this.form);
  }

  guardarVehiculo() {
    const f = this.form;
    if (!f.placa?.trim() || !f.tipoVehiculo || !(f.valorDia > 0)) {
      this.errorForm.set('La placa, el tipo y un valor por día mayor a cero son obligatorios.');
      return;
    }
    this.guardando.set(true);
    this.errorForm.set('');
    const subir$: Observable<{ url: string } | null> = this.archivo ? this.servicioVehiculo.subirImagen(this.archivo) : of(null);
    subir$
      .pipe(
        switchMap((r): Observable<any> => {
          if (r) f.imagenUrl = r.url;
          return f.id ? this.servicioVehiculo.actualizarVehiculo(f) : this.servicioVehiculo.guardarVehiculo(f);
        })
      )
      .subscribe({
        next: (v) => {
          this.guardando.set(false);
          this.formAbierto.set(false);
          this.notificacion.ok(f.id ? `Vehículo ${v.placa} actualizado` : `Vehículo ${v.placa} agregado a la flota`);
          this.cargar();
        },
        error: (err) => {
          this.guardando.set(false);
          this.errorForm.set(mensajeError(err));
        },
      });
  }

  async eliminarVehiculo(v: any) {
    const ok = await this.confirmar.pedir({
      titulo: 'Eliminar vehículo',
      mensaje: `¿Eliminar el vehículo ${v.placa} de la flota? Esta acción no se puede deshacer. Si ya tuvo alquileres, ponlo en mantenimiento en su lugar.`,
      textoOk: 'Sí, eliminar',
      peligro: true,
    });
    if (!ok) return;
    this.servicioVehiculo.eliminarVehiculo(v.id).subscribe({
      next: () => { this.notificacion.ok(`Vehículo ${v.placa} eliminado`); this.cargar(); },
      error: (err) => this.notificacion.error(mensajeError(err)),
    });
  }
}
