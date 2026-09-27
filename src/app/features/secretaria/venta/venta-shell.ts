import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CartService } from '../../../core/cart/cart.service';
import { CartDrawer } from '../../../shared/ui/cart-drawer/cart-drawer';
import { Icon } from '../../../shared/ui/icon/icon';
import { PageHeader } from '../../../shared/ui/page-header/page-header';

/**
 * Envoltorio delgado que reutiliza el catálogo/ficha del cliente (vía
 * router-outlet) y monta el MISMO drawer de carrito que usa el cliente. Al
 * vivir en este subárbol de rutas, todos resuelven la instancia de
 * CartService que provee venta.routes.ts (clave de localStorage propia).
 */
@Component({
  selector: 'app-venta-shell',
  imports: [RouterOutlet, CartDrawer, Icon, PageHeader],
  templateUrl: './venta-shell.html',
  styleUrl: './venta-shell.scss',
})
export class VentaShell {
  protected cart = inject(CartService);
}
