import { Routes } from '@angular/router';
import { authGuard, roleGuard, soloInvitadosGuard } from './core/auth/guards';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'catalogo' },
  {
    path: 'auth/login',
    canActivate: [soloInvitadosGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'auth/registro',
    canActivate: [soloInvitadosGuard],
    loadComponent: () => import('./features/auth/registro/registro').then((m) => m.Registro),
  },
  {
    path: 'catalogo',
    loadChildren: () =>
      import('./features/catalogo/catalogo.routes').then((m) => m.CATALOGO_ROUTES),
  },
  {
    path: 'checkout',
    canActivate: [roleGuard(['cliente'])],
    loadComponent: () => import('./features/checkout/checkout').then((m) => m.Checkout),
  },
  {
    path: 'mis-pedidos',
    canActivate: [roleGuard(['cliente'])],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/pedidos-cliente/pedidos-cliente').then((m) => m.PedidosCliente),
      },
      {
        path: ':id/seguimiento',
        loadComponent: () =>
          import('./features/seguimiento/seguimiento').then((m) => m.Seguimiento),
      },
    ],
  },
  {
    path: 'secretaria',
    canActivate: [roleGuard(['vendedor'])],
    loadChildren: () =>
      import('./features/secretaria/secretaria.routes').then((m) => m.SECRETARIA_ROUTES),
  },
  {
    path: 'admin',
    canActivate: [roleGuard(['admin'])],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  { path: '**', redirectTo: 'catalogo' },
];
