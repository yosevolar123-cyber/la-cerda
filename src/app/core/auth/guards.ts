import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ROLE_HOME_ROUTE, Rol } from '../models/roles';
import { destinoSeguro } from './redirect';

/**
 * Sin sesión: manda al login recordando a dónde quería ir (`?redirect=`), para
 * volver ahí tras iniciar sesión (ej. checkout con el carrito ya armado).
 */
function irAlLogin(router: Router, url: string) {
  return router.createUrlTree(['/auth/login'], { queryParams: { redirect: url } });
}

export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.listo;
  if (auth.autenticado()) return true;
  return irAlLogin(router, state.url);
};

export function roleGuard(rolesPermitidos: Rol[]): CanActivateFn {
  return async (_route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    await auth.listo;

    if (!auth.autenticado()) {
      return irAlLogin(router, state.url);
    }
    const rol = auth.rol();
    if (rol && rolesPermitidos.includes(rol)) return true;

    // Autenticado pero sin permiso: lo mandamos a su propia home, no al login.
    return router.createUrlTree([rol ? ROLE_HOME_ROUTE[rol] : '/']);
  };
}

/** Para /auth/login y /auth/registro: si ya hay sesión, redirige a donde iba o a su home. */
export const soloInvitadosGuard: CanActivateFn = async (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.listo;

  if (!auth.autenticado()) return true;
  const destino = destinoSeguro(route.queryParamMap.get('redirect'));
  if (destino) return router.parseUrl(destino);
  const rol = auth.rol();
  return router.createUrlTree([rol ? ROLE_HOME_ROUTE[rol] : '/']);
};
