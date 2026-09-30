import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { UsuarioService } from '../servicios/usuario';
import { AdministradorService } from '../servicios/administrador';
import { SesionService } from '../servicios/sesion';
import { Placa } from '../shared/placa';
import { mensajeError } from '../util/errores';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, Placa],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  tipo = signal<'usuario' | 'administrador'>('usuario');
  error = signal('');
  cargando = signal(false);

  identificacion: string = '';
  passwordUsuario: string = '';

  usuarioAdmin: string = '';
  passwordAdmin: string = '';

  constructor(
    private servicioUsuario: UsuarioService,
    private servicioAdministrador: AdministradorService,
    private sesion: SesionService,
    private router: Router
  ) {}

  cambiarTipo(tipo: 'usuario' | 'administrador') {
    this.tipo.set(tipo);
    this.error.set('');
  }

  ingresar() {
    this.tipo() === 'usuario' ? this.loginUsuario() : this.loginAdministrador();
  }

  loginUsuario() {
    if (!this.identificacion.trim() || !this.passwordUsuario) {
      this.error.set('Escribe tu número de identificación y tu contraseña.');
      return;
    }
    this.error.set('');
    this.cargando.set(true);
    this.servicioUsuario.login(this.identificacion, this.passwordUsuario).subscribe({
      next: (dato) => {
        this.cargando.set(false);
        if (dato == null) {
          this.error.set('Identificación o contraseña incorrecta.');
        } else {
          this.sesion.iniciarSesionUsuario(dato);
          this.router.navigate(['/vehiculos']);
        }
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(mensajeError(err));
      }
    });
  }

  loginAdministrador() {
    if (!this.usuarioAdmin.trim() || !this.passwordAdmin) {
      this.error.set('Escribe tu usuario y tu contraseña.');
      return;
    }
    this.error.set('');
    this.cargando.set(true);
    this.servicioAdministrador.login(this.usuarioAdmin, this.passwordAdmin).subscribe({
      next: (dato) => {
        this.cargando.set(false);
        if (dato == null) {
          this.error.set('Usuario o contraseña incorrecta.');
        } else {
          this.sesion.iniciarSesionAdministrador(dato);
          this.router.navigate(['/admin']);
        }
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(mensajeError(err));
      }
    });
  }
}
