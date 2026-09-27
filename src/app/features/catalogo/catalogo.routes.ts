import { Routes } from '@angular/router';

export const CATALOGO_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./lista/lista').then((m) => m.Lista) },
  { path: ':id', loadComponent: () => import('./detalle/detalle').then((m) => m.Detalle) },
];
