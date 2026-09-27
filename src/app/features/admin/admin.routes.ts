import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./dashboard/dashboard').then((m) => m.DashboardAdmin) },
  {
    path: 'productos',
    loadComponent: () => import('./productos/lista/lista').then((m) => m.ListaProductosAdmin),
  },
  {
    path: 'productos/nuevo',
    loadComponent: () =>
      import('./productos/formulario/formulario').then((m) => m.FormularioProductoAdmin),
  },
  {
    path: 'productos/:id',
    loadComponent: () =>
      import('./productos/formulario/formulario').then((m) => m.FormularioProductoAdmin),
  },
  {
    path: 'inventario',
    loadComponent: () => import('./inventario/inventario').then((m) => m.InventarioAdmin),
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./usuarios/usuarios').then((m) => m.UsuariosAdmin),
  },
  {
    path: 'reportes',
    loadComponent: () => import('./reportes/reportes').then((m) => m.ReportesAdmin),
  },
];
