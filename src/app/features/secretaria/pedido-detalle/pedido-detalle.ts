import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  EstadoPedido,
  PedidosSecretariaService,
} from '../../../core/secretaria/pedidos-secretaria.service';
import {
  estadoUI,
  EstadoUI,
  ESTADO_RAW_LABELS,
  ESTADO_UI_LABELS,
  ESTADO_UI_TONE,
} from '../../../core/models/estado-pedido';
import { enlaceWhatsApp, mensajeEstadoPedido } from '../../../core/whatsapp';
import { Card } from '../../../shared/ui/card/card';
import { Badge } from '../../../shared/ui/badge/badge';
import { Button } from '../../../shared/ui/button/button';
import { Icon } from '../../../shared/ui/icon/icon';
import { PageHeader } from '../../../shared/ui/page-header/page-header';

const ESTADOS: EstadoPedido[] = [
  'pendiente',
  'confirmado',
  'en preparación',
  'enviado',
  'entregado',
  'cancelado',
];

@Component({
  selector: 'app-pedido-detalle',
  imports: [ReactiveFormsModule, Card, Badge, Button, DatePipe, Icon, PageHeader],
  templateUrl: './pedido-detalle.html',
  styleUrl: './pedido-detalle.scss',
})
export class PedidoDetalle implements OnInit {
  private route = inject(ActivatedRoute);
  private pedidosSvc = inject(PedidosSecretariaService);
  private fb = inject(FormBuilder);

  readonly estados = ESTADOS;
  readonly ESTADO_RAW_LABELS = ESTADO_RAW_LABELS;
  readonly ESTADO_UI_LABELS = ESTADO_UI_LABELS;
  estadoUI = estadoUI;

  tonoEstado(estado: EstadoPedido) {
    return ESTADO_UI_TONE[estadoUI(estado)];
  }

  /** Los 3 pasos visibles del progreso (cancelado se muestra aparte). */
  readonly pasos: EstadoUI[] = ['pendiente', 'enviado', 'recibido'];

  indicePaso(estado: EstadoPedido): number {
    return this.pasos.indexOf(estadoUI(estado));
  }

  total = computed(() =>
    (this.pedido()?.detalle_pedido ?? []).reduce((suma, d) => suma + (d.subtotal ?? 0), 0),
  );

  pedido = signal<Awaited<ReturnType<PedidosSecretariaService['obtenerPedido']>> | null>(null);
  envio = signal<{
    id: string;
    direccion_entrega: string;
    costo_envio: number | null;
    fecha_estimada: string | null;
    estado: string | null;
  } | null>(null);
  telefonoCliente = signal<string | null>(null);
  cargando = signal(true);
  guardando = signal(false);
  enlaceWhatsappCliente = signal<string | null>(null);

  formEnvio = this.fb.group({
    fecha_estimada: [''],
    costo_envio: [null as number | null],
  });

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    await this.cargar(id);
  }

  private async cargar(id: string) {
    const pedido = await this.pedidosSvc.obtenerPedido(id);
    this.pedido.set(pedido);

    const envio = Array.isArray(pedido.envios) ? pedido.envios[0] : pedido.envios;
    this.envio.set(envio ?? null);
    this.formEnvio.patchValue({
      fecha_estimada: envio?.fecha_estimada ? envio.fecha_estimada.slice(0, 16) : '',
      costo_envio: envio?.costo_envio ?? null,
    });

    const usuarioId =
      pedido.clientes && !Array.isArray(pedido.clientes) ? pedido.clientes.usuario_id : null;
    if (usuarioId) {
      this.telefonoCliente.set(await this.pedidosSvc.telefonoDeUsuario(usuarioId));
    }
    this.cargando.set(false);
  }

  async cambiarEstado(estado: EstadoPedido) {
    const p = this.pedido();
    if (!p) return;
    this.guardando.set(true);
    await this.pedidosSvc.cambiarEstado(p.id, estado);
    await this.cargar(p.id);
    this.guardando.set(false);
  }

  async guardarEnvio() {
    const p = this.pedido();
    const envio = this.envio();
    if (!p || !envio) return;
    this.guardando.set(true);
    const { fecha_estimada, costo_envio } = this.formEnvio.getRawValue();
    await this.pedidosSvc.actualizarEnvio(envio.id, {
      fecha_estimada: fecha_estimada || null,
      costo_envio,
    });
    await this.cargar(p.id);
    this.guardando.set(false);
  }

  generarEnlaceWhatsapp() {
    const p = this.pedido();
    const telefono = this.telefonoCliente();
    const envio = this.envio();
    if (!p || !telefono) return;
    const mensaje = mensajeEstadoPedido({
      codigo: p.codigo ?? '',
      estado: p.estado,
      fechaEstimada: envio?.fecha_estimada,
      costoEnvio: envio?.costo_envio,
    });
    this.enlaceWhatsappCliente.set(enlaceWhatsApp(`591${telefono}`, mensaje));
  }
}
