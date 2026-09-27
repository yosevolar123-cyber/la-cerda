import { Routes } from '@angular/router';

export const SECRETARIA_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard) },
  { path: 'venta', loadChildren: () => import('./venta/venta.routes').then((m) => m.VENTA_ROUTES) },
  {
    path: ':id',
    loadComponent: () => import('./pedido-detalle/pedido-detalle').then((m) => m.PedidoDetalle),
  },
];
