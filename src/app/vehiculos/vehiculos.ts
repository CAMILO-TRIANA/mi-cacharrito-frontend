import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { VehiculoService } from '../servicios/vehiculo';
import { AlquilerService } from '../servicios/alquiler';
import { SesionService } from '../servicios/sesion';
import { NotificacionService } from '../servicios/notificacion';
import { Vehiculo } from '../entidades/vehiculo';
import { Alquiler } from '../entidades/alquiler';
import { Modal } from '../shared/modal';
import { Foto } from '../shared/foto';
import { Placa } from '../shared/placa';
import { VisorPdf } from '../shared/visor-pdf';
import { CopPipe, FechaPipe, diasEntre, hoyISO } from '../util/formato';
import { mensajeError } from '../util/errores';
import { TIPOS, colorHex, etiquetaTipo, licenciaHabilita, tituloVehiculo } from '../util/vehiculo-util';

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [FormsModule, Modal, Foto, Placa, VisorPdf, CopPipe, FechaPipe],
  templateUrl: './vehiculos.html',
  styleUrl: './vehiculos.css',
})
export class Vehiculos implements OnInit {
  // Catalogo
  todos = signal<Vehiculo[]>([]);
  cargando = signal(true);
  falloCarga = signal(false);
  tipo = signal<string>('todos');
  texto = signal('');
  orden = signal<'precio-asc' | 'precio-desc'>('precio-asc');

  tiposFiltro = [{ valor: 'todos', etiqueta: 'Todos' }, ...TIPOS];

  conteo = computed(() => {
    const c: Record<string, number> = { todos: this.todos().length };
    for (const v of this.todos()) c[v.tipoVehiculo] = (c[v.tipoVehiculo] ?? 0) + 1;
    return c;
  });

  visibles = computed(() => {
    const t = this.tipo();
    const q = this.texto().trim().toLowerCase();
    const lista = this.todos().filter(
      (v) =>
        (t === 'todos' || v.tipoVehiculo === t) &&
        (!q || `${v.marca ?? ''} ${v.modelo ?? ''} ${v.placa} ${v.color}`.toLowerCase().includes(q))
    );
    const factor = this.orden() === 'precio-asc' ? 1 : -1;
    return [...lista].sort((a, b) => (a.valorDia - b.valorDia) * factor);
  });

  // Modal de alquiler
  elegido = signal<Vehiculo | null>(null);
  creado = signal<any | null>(null);
  enviando = signal(false);
  errorServidor = signal('');
  pdfNumero = signal<string | null>(null);
  fechaInicio: string = '';
  fechaEntrega: string = '';
  hoy = hoyISO();

  usuario: any = null;

  // Helpers para la plantilla
  titulo = tituloVehiculo;
  etiquetaTipo = etiquetaTipo;
  colorHex = colorHex;

  constructor(
    private servicioVehiculo: VehiculoService,
    private servicioAlquiler: AlquilerService,
    private sesion: SesionService,
    private notificacion: NotificacionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuario = this.sesion.usuarioSignal();
    this.cargar();
  }

  get primerNombre(): string {
    return (this.usuario?.nombreCompleto ?? '').split(' ')[0];
  }

  cargar() {
    this.cargando.set(true);
    this.falloCarga.set(false);
    this.servicioVehiculo.listarDisponibles().subscribe({
      next: (dato) => {
        this.todos.set(dato);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.falloCarga.set(true);
        this.notificacion.error(mensajeError(err));
      },
    });
  }

  // ---- Modal de alquiler ----
  elegir(v: Vehiculo) {
    this.elegido.set(v);
    this.creado.set(null);
    this.errorServidor.set('');
    this.fechaInicio = this.hoy;
    this.fechaEntrega = '';
  }

  cerrarModal() {
    this.elegido.set(null);
    this.creado.set(null);
    this.pdfNumero.set(null);
  }

  dias(): number {
    if (!this.fechaInicio || !this.fechaEntrega) return 0;
    if (this.fechaEntrega < this.fechaInicio) return 0;
    return Math.max(1, diasEntre(this.fechaInicio, this.fechaEntrega));
  }

  total(): number {
    return this.dias() * (this.elegido()?.valorDia ?? 0);
  }

  // Problemas con las fechas elegidas
  errorFechas(): string {
    if (this.fechaInicio && this.fechaInicio < this.hoy) return 'La fecha de inicio no puede ser anterior a hoy.';
    if (this.fechaInicio && this.fechaEntrega && this.fechaEntrega < this.fechaInicio)
      return 'La fecha de entrega no puede ser anterior a la de inicio.';
    return '';
  }

  // Problemas con la licencia del usuario para este vehiculo y estas fechas
  errorLicencia(): string {
    const v = this.elegido();
    const u = this.usuario;
    if (!v || !u) return '';
    if (!licenciaHabilita(u.categoriaLicencia, v.tipoVehiculo)) {
      return `Tu licencia categoría ${u.categoriaLicencia} no te habilita para conducir este tipo de vehículo.`;
    }
    if (this.fechaEntrega && u.vigenciaLicencia && u.vigenciaLicencia < this.fechaEntrega) {
      return `Tu licencia vence el ${u.vigenciaLicencia}, antes de la fecha de entrega. Elige una fecha dentro de su vigencia.`;
    }
    return '';
  }

  puedeConfirmar(): boolean {
    return this.dias() > 0 && !this.errorFechas() && !this.errorLicencia();
  }

  confirmarAlquiler() {
    const v = this.elegido();
    if (!this.usuario || !v || !this.puedeConfirmar()) return;

    const nuevoAlquiler = new Alquiler();
    nuevoAlquiler.usuario = this.usuario;
    nuevoAlquiler.vehiculo = v;
    nuevoAlquiler.fechaInicio = this.fechaInicio;
    nuevoAlquiler.fechaEntregaPactada = this.fechaEntrega;

    this.enviando.set(true);
    this.errorServidor.set('');
    this.servicioAlquiler.guardarAlquiler(nuevoAlquiler).subscribe({
      next: (dato) => {
        this.enviando.set(false);
        this.creado.set(dato);
        this.pdfNumero.set(dato.numeroAlquiler); // el PDF se genera al aceptar
        this.cargar();
      },
      error: (err) => {
        this.enviando.set(false);
        this.errorServidor.set(mensajeError(err));
        if (err?.status === 409) this.cargar(); // el vehiculo ya no estaba disponible
      },
    });
  }

  irMisAlquileres() {
    this.cerrarModal();
    this.router.navigate(['/mis-alquileres']);
  }
}
