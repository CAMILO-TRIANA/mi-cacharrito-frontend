import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { UsuarioService } from '../servicios/usuario';
import { NotificacionService } from '../servicios/notificacion';
import { Usuario } from '../entidades/usuario';
import { CATEGORIAS_LICENCIA } from '../util/vehiculo-util';
import { hoyISO } from '../util/formato';
import { mensajeError } from '../util/errores';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  usuario: Usuario = new Usuario();
  confirmarPassword: string = '';
  categorias = CATEGORIAS_LICENCIA;
  hoy = hoyISO();

  intentado = signal(false);
  cargando = signal(false);
  errorServidor = signal('');

  constructor(
    private servicioUsuario: UsuarioService,
    private notificacion: NotificacionService,
    private router: Router
  ) {}

  // Devuelve un mensaje por cada campo invalido (vacio si todo esta bien)
  errores(): Record<string, string> {
    const u = this.usuario;
    const e: Record<string, string> = {};
    if (!/^\d{5,15}$/.test(u.numeroIdentificacion.trim())) e['numeroIdentificacion'] = 'Solo números, entre 5 y 15 dígitos.';
    if (u.nombreCompleto.trim().length < 5) e['nombreCompleto'] = 'Escribe tu nombre completo.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.correo.trim())) e['correo'] = 'Escribe un correo válido.';
    if (!/^\d{7,12}$/.test(u.telefono.replace(/\s/g, ''))) e['telefono'] = 'Solo números, entre 7 y 12 dígitos.';
    if (!u.categoriaLicencia) e['categoriaLicencia'] = 'Elige la categoría de tu licencia.';
    if (!u.fechaExpedicionLicencia) e['fechaExpedicionLicencia'] = 'Indica cuándo se expidió.';
    else if (u.fechaExpedicionLicencia > this.hoy) e['fechaExpedicionLicencia'] = 'La fecha de expedición no puede ser futura.';
    if (!u.vigenciaLicencia) e['vigenciaLicencia'] = 'Indica hasta cuándo es válida.';
    else if (u.vigenciaLicencia < this.hoy) e['vigenciaLicencia'] = 'Tu licencia debe estar vigente.';
    else if (u.fechaExpedicionLicencia && u.vigenciaLicencia <= u.fechaExpedicionLicencia) e['vigenciaLicencia'] = 'Debe ser posterior a la expedición.';
    if (u.password.length < 6) e['password'] = 'Mínimo 6 caracteres.';
    if (this.confirmarPassword !== u.password) e['confirmarPassword'] = 'Las contraseñas no coinciden.';
    return e;
  }

  registrar() {
    this.intentado.set(true);
    this.errorServidor.set('');
    if (Object.keys(this.errores()).length > 0) return;

    this.cargando.set(true);
    this.servicioUsuario.guardarUsuario(this.usuario).subscribe({
      next: () => {
        this.cargando.set(false);
        this.notificacion.ok('Cuenta creada. Ya puedes iniciar sesión.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.cargando.set(false);
        this.errorServidor.set(mensajeError(err));
      }
    });
  }
}
