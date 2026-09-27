import { Component, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { CartService } from '../../core/cart/cart.service';
import { ROLE_LABELS } from '../../core/models/roles';
import { Button } from '../../shared/ui/button/button';
import { Icon } from '../../shared/ui/icon/icon';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Button, Icon],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  host: {
    '(window:scroll)': 'alDesplazar()',
  },
})
export class Header {
  protected auth = inject(AuthService);
  protected router = inject(Router);
  protected cart = inject(CartService);

  menuAbierto = signal(false);
  /** El header pasa de translúcido a "flotante" con sombra al hacer scroll. */
  desplazado = signal(false);

  alDesplazar() {
    this.desplazado.set(window.scrollY > 8);
  }
  readonly ROLE_LABELS = ROLE_LABELS;

  /** Feedback inmediato al agregar al carrito (fase D): rebote breve del ícono. */
  animarCarrito = signal(false);
  private cantidadAnterior = this.cart.cantidadTotal();

  constructor() {
    effect(() => {
      const actual = this.cart.cantidadTotal();
      if (actual > this.cantidadAnterior) {
        this.animarCarrito.set(false);
        requestAnimationFrame(() => {
          this.animarCarrito.set(true);
          setTimeout(() => this.animarCarrito.set(false), 400);
        });
      }
      this.cantidadAnterior = actual;
    });
  }

  toggleMenu() {
    this.menuAbierto.update((v) => !v);
  }

  cerrarMenu() {
    this.menuAbierto.set(false);
  }

  async salir() {
    await this.auth.cerrarSesion();
    this.cerrarMenu();
    this.router.navigateByUrl('/auth/login');
  }
}
