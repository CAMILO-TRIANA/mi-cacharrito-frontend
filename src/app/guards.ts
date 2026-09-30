import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SesionService } from './servicios/sesion';

// Solo entra un cliente con sesion iniciada
export const soloUsuario: CanActivateFn = () => {
  const sesion = inject(SesionService);
  return sesion.usuarioSignal() ? true : inject(Router).createUrlTree(['/login']);
};

// Solo entra un administrador con sesion iniciada
export const soloAdmin: CanActivateFn = () => {
  const sesion = inject(SesionService);
  return sesion.administradorSignal() ? true : inject(Router).createUrlTree(['/login']);
};

// Login y registro: si ya hay sesion, se manda a su pagina principal
export const soloInvitado: CanActivateFn = () => {
  const sesion = inject(SesionService);
  const router = inject(Router);
  if (sesion.usuarioSignal()) return router.createUrlTree(['/vehiculos']);
  if (sesion.administradorSignal()) return router.createUrlTree(['/admin']);
  return true;
};
