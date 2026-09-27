import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { CartService } from '../../../../core/cart/cart.service';
import { PedidosService } from '../../../../core/catalogo/pedidos.service';
import {
  ClientesBusquedaService,
  ClienteResultado,
} from '../../../../core/secretaria/clientes-busqueda.service';
import { enlaceWhatsApp, mensajePedidoCliente, WHATSAPP_NEGOCIO } from '../../../../core/whatsapp';
import { Button } from '../../../../shared/ui/button/button';
import { Icon } from '../../../../shared/ui/icon/icon';

@Component({
  selector: 'app-confirmar-venta',
  imports: [ReactiveFormsModule, RouterLink, Button, Icon],
  templateUrl: './confirmar-venta.html',
  styleUrl: './confirmar-venta.scss',
})
export class ConfirmarVenta {
  protected cart = inject(CartService);
  private auth = inject(AuthService);
  private pedidosSvc = inject(PedidosService);
  private clientesSvc = inject(ClientesBusquedaService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  modalidad = signal<'local' | 'envio'>('local');
  clienteSeleccionado = signal<ClienteResultado | null>(null);
  resultadosBusqueda = signal<ClienteResultado[]>([]);
  buscando = signal(false);
  terminoBusqueda = signal('');

  guardando = signal(false);
  error = signal<string | null>(null);
  ventaConfirmada = signal<{ codigo: string; enlaceWhatsapp: string | null } | null>(null);

  form = this.fb.nonNullable.group({
    direccion: [''],
  });

  async buscarCliente(termino: string) {
    this.terminoBusqueda.set(termino);
    if (termino.trim().length < 2) {
      this.resultadosBusqueda.set([]);
      return;
    }
    this.buscando.set(true);
    this.resultadosBusqueda.set(await this.clientesSvc.buscar(termino));
    this.buscando.set(false);
  }

  seleccionarCliente(c: ClienteResultado) {
    this.clienteSeleccionado.set(c);
    this.resultadosBusqueda.set([]);
    this.terminoBusqueda.set('');
  }

  quitarCliente() {
    this.clienteSeleccionado.set(null);
  }

  async confirmar() {
    this.error.set(null);
    if (this.cart.items().length === 0) return;

    if (this.modalidad() === 'envio' && !this.form.controls.direccion.value?.trim()) {
      this.form.controls.direccion.setErrors({ required: true });
      this.form.controls.direccion.markAsTouched();
      return;
    }

    const usuarioId = this.auth.usuario()?.id;
    if (!usuarioId) return;

    this.guardando.set(true);
    try {
      const items = this.cart.items();
      const total = this.cart.total();
      const cliente = this.clienteSeleccionado();
      const direccion = this.form.controls.direccion.value?.trim();

      const pedido = await this.pedidosSvc.crearPedido({
        clienteId: cliente?.id,
        vendedorId: usuarioId,
        tipoVenta: 'minorista',
        items,
        canalOrigen: 'secretaria_mostrador',
        modalidadEntrega: this.modalidad(),
        direccion: this.modalidad() === 'envio' ? direccion : undefined,
      });

      let enlaceWhatsapp: string | null = null;
      if (this.modalidad() === 'envio' && cliente?.telefono) {
        const mensaje = mensajePedidoCliente({
          codigo: pedido.codigo,
          items,
          total,
          nombreCliente: cliente.nombre,
          telefono: cliente.telefono,
          direccion: direccion ?? '',
        });
        enlaceWhatsapp = enlaceWhatsApp(`591${cliente.telefono}`, mensaje);
      }

      this.ventaConfirmada.set({ codigo: pedido.codigo, enlaceWhatsapp });
      this.cart.vaciar();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'No se pudo registrar la venta.');
    } finally {
      this.guardando.set(false);
    }
  }

  nuevaVenta() {
    this.router.navigateByUrl('/secretaria/venta');
  }
}
