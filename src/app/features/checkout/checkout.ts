import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { CartService } from '../../core/cart/cart.service';
import { PedidosService } from '../../core/catalogo/pedidos.service';
import { enlaceWhatsApp, mensajePedidoCliente, WHATSAPP_NEGOCIO } from '../../core/whatsapp';
import { Button } from '../../shared/ui/button/button';
import { FieldError } from '../../shared/ui/field-error/field-error';
import { Icon } from '../../shared/ui/icon/icon';
import { PageHeader } from '../../shared/ui/page-header/page-header';

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, RouterLink, Button, FieldError, Icon, PageHeader],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout {
  protected auth = inject(AuthService);
  protected cart = inject(CartService);
  private pedidosSvc = inject(PedidosService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  enviando = signal(false);
  error = signal<string | null>(null);
  pedidoConfirmado = signal<{ id: string; codigo: string; enlaceWhatsapp: string } | null>(null);

  form = this.fb.nonNullable.group({
    direccion: ['', [Validators.required, Validators.minLength(6)]],
    enlaceUbicacion: [''],
  });

  get direccion() {
    return this.form.controls.direccion;
  }

  async confirmar() {
    this.error.set(null);
    if (this.cart.items().length === 0) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const cliente = this.auth.cliente();
    if (!cliente) {
      this.error.set('Debes iniciar sesión para completar tu pedido.');
      return;
    }

    this.enviando.set(true);
    const { direccion, enlaceUbicacion } = this.form.getRawValue();
    const direccionCompleta = enlaceUbicacion
      ? `${direccion} (ubicación: ${enlaceUbicacion})`
      : direccion;

    try {
      const items = this.cart.items();
      const total = this.cart.total();
      const pedido = await this.pedidosSvc.crearPedido({
        clienteId: cliente.id,
        tipoVenta: 'minorista',
        items,
        direccion: direccionCompleta,
      });

      const mensaje = mensajePedidoCliente({
        codigo: pedido.codigo,
        items,
        total,
        nombreCliente: cliente.nombre,
        telefono: cliente.telefono,
        direccion: direccionCompleta,
      });

      this.pedidoConfirmado.set({
        id: pedido.id,
        codigo: pedido.codigo,
        enlaceWhatsapp: enlaceWhatsApp(WHATSAPP_NEGOCIO, mensaje),
      });
      this.cart.vaciar();
    } catch (e) {
      this.error.set('No pudimos registrar tu pedido. Intenta nuevamente.');
      console.error(e);
    } finally {
      this.enviando.set(false);
    }
  }

  volverAlCatalogo() {
    this.router.navigateByUrl('/catalogo');
  }
}
