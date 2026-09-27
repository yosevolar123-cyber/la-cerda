import { Routes } from '@angular/router';
import { CART_STORAGE_KEY, CartService } from '../../../core/cart/cart.service';

/**
 * Muestra el MISMO catálogo (Lista) y ficha de producto (Detalle) que usa el
 * cliente, con su propia instancia de CartService (clave de localStorage
 * separada) inyectada a nivel de ruta.
 *
 * OJO: se importan Lista/Detalle directamente en vez de reutilizar el array
 * CATALOGO_ROUTES por spread (`...CATALOGO_ROUTES`) — aunque el spread copia
 * el array, copia los mismos objetos Route por referencia, y el Router de
 * Angular cachea estado de carga (_loadedComponent, injector) directamente
 * sobre esos objetos la primera vez que se activan. Compartir el objeto
 * ':id' entre el árbol de '/catalogo' y este árbol de '/secretaria/venta'
 * hacía que el estado de un árbol contaminara al otro — la causa real del
 * "No encontramos este producto." al entrar a Vender. Con objetos Route
 * propios (aunque apunten al mismo componente) cada árbol tiene su propio
 * estado de caché, aislado.
 */
export const VENTA_ROUTES: Routes = [
  {
    path: '',
    providers: [{ provide: CART_STORAGE_KEY, useValue: 'la-cerda:venta-mostrador' }, CartService],
    loadComponent: () => import('./venta-shell').then((m) => m.VentaShell),
    children: [
      {
        path: '',
        data: { mostrarHero: false },
        loadComponent: () => import('../../catalogo/lista/lista').then((m) => m.Lista),
      },
      {
        path: 'confirmar',
        loadComponent: () => import('./confirmar/confirmar-venta').then((m) => m.ConfirmarVenta),
      },
      {
        path: ':id',
        loadComponent: () => import('../../catalogo/detalle/detalle').then((m) => m.Detalle),
      },
    ],
  },
];
