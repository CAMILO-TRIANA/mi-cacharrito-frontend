import { Routes } from '@angular/router';
import { Registro } from './registro/registro';
import { Login } from './login/login';
import { Vehiculos } from './vehiculos/vehiculos';
import { MisAlquileres } from './mis-alquileres/mis-alquileres';
import { Admin } from './admin/admin';
import { soloAdmin, soloInvitado, soloUsuario } from './guards';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login, canActivate: [soloInvitado], title: 'Ingresar | Mi Cacharrito' },
  { path: 'registro', component: Registro, canActivate: [soloInvitado], title: 'Crear cuenta | Mi Cacharrito' },
  { path: 'vehiculos', component: Vehiculos, canActivate: [soloUsuario], title: 'Vehículos | Mi Cacharrito' },
  { path: 'mis-alquileres', component: MisAlquileres, canActivate: [soloUsuario], title: 'Mis alquileres | Mi Cacharrito' },
  { path: 'admin', component: Admin, canActivate: [soloAdmin], title: 'Panel | Mi Cacharrito' },
  { path: '**', redirectTo: '/login' },
];
