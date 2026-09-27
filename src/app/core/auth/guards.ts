import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ROLE_HOME_ROUTE, Rol } from '../models/roles';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.listo;
  if (auth.autenticado()) return true;
  return router.createUrlTree(['/auth/login']);
};

export function roleGuard(rolesPermitidos: Rol[]): CanActivateFn {
  return async () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    await auth.listo;

    if (!auth.autenticado()) {
      return router.createUrlTree(['/auth/login']);
    }
    const rol = auth.rol();
    if (rol && rolesPermitidos.includes(rol)) return true;

    // Autenticado pero sin permiso: lo mandamos a su propia home, no al login.
    return router.createUrlTree([rol ? ROLE_HOME_ROUTE[rol] : '/']);
  };
}

/** Para /auth/login y /auth/registro: si ya hay sesión, redirige a su home. */
export const soloInvitadosGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.listo;

  if (!auth.autenticado()) return true;
  const rol = auth.rol();
  return router.createUrlTree([rol ? ROLE_HOME_ROUTE[rol] : '/']);
};
