import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { PedidosService } from '../../core/catalogo/pedidos.service';
import {
  estadoUI,
  ESTADO_UI_LABELS,
  ESTADO_UI_TONE,
  EstadoPedido,
} from '../../core/models/estado-pedido';
import { Badge } from '../../shared/ui/badge/badge';
import { Icon } from '../../shared/ui/icon/icon';
import { PageHeader } from '../../shared/ui/page-header/page-header';

@Component({
  selector: 'app-pedidos-cliente',
  imports: [Badge, DatePipe, RouterLink, Icon, PageHeader],
  templateUrl: './pedidos-cliente.html',
  styleUrl: './pedidos-cliente.scss',
})
export class PedidosCliente implements OnInit {
  private auth = inject(AuthService);
  private pedidosSvc = inject(PedidosService);

  pedidos = signal<Awaited<ReturnType<PedidosService['pedidosDeCliente']>>>([]);
  cargando = signal(true);

  readonly ESTADO_UI_LABELS = ESTADO_UI_LABELS;
  estadoUI = estadoUI;

  tonoEstado(estado: EstadoPedido) {
    return ESTADO_UI_TONE[estadoUI(estado)];
  }

  async ngOnInit() {
    const cliente = this.auth.cliente();
    if (!cliente) {
      this.cargando.set(false);
      return;
    }
    this.pedidos.set(await this.pedidosSvc.pedidosDeCliente(cliente.id));
    this.cargando.set(false);
  }
}
