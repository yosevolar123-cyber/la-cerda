import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../../core/cart/cart.service';
import { Button } from '../button/button';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-cart-drawer',
  imports: [Button, Icon],
  templateUrl: './cart-drawer.html',
  styleUrl: './cart-drawer.scss',
  host: {
    '(document:keydown.escape)': 'cart.cerrar()',
  },
})
export class CartDrawer {
  protected cart = inject(CartService);
  private router = inject(Router);

  /** A dónde lleva "Ir a pagar" — checkout del cliente por defecto, o el
   *  confirmar de la venta de mostrador cuando este drawer se monta ahí. */
  rutaCheckout = input('/checkout');
  textoBoton = input('Ir a pagar');

  irACheckout() {
    this.cart.cerrar();
    this.router.navigateByUrl(this.rutaCheckout());
  }
}
