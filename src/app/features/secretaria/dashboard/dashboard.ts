import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PedidosSecretariaService } from '../../../core/secretaria/pedidos-secretaria.service';
import {
  estadoUI,
  ESTADO_UI_LABELS,
  ESTADO_UI_TONE,
  EstadoPedido,
  EstadoUI,
} from '../../../core/models/estado-pedido';
import { Badge } from '../../../shared/ui/badge/badge';
import { Icon } from '../../../shared/ui/icon/icon';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { StatCard } from '../../../shared/ui/stat-card/stat-card';

const PASOS_PRINCIPALES: EstadoUI[] = ['pendiente', 'enviado', 'recibido'];

@Component({
  selector: 'app-secretaria-dashboard',
  imports: [Badge, RouterLink, DatePipe, Icon, PageHeader, StatCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private pedidosSvc = inject(PedidosSecretariaService);

  contadores = signal({ pendientes: 0, enviados: 0, recibidosHoy: 0 });
  pedidos = signal<Awaited<ReturnType<PedidosSecretariaService['listarPedidos']>>>([]);
  filtro = signal<EstadoUI | null>(null);
  mostrarCancelados = signal(false);
  cargando = signal(true);

  readonly pasosPrincipales = PASOS_PRINCIPALES;
  readonly ESTADO_UI_LABELS = ESTADO_UI_LABELS;

  estadoUI = estadoUI;

  tonoEstado(estado: EstadoPedido) {
    return ESTADO_UI_TONE[estadoUI(estado)];
  }

  async ngOnInit() {
    await this.cargar();
  }

  async cargar() {
    this.cargando.set(true);
    const [contadores, pedidos] = await Promise.all([
      this.pedidosSvc.contarPorEstado(),
      this.pedidosSvc.listarPedidos(this.filtro() ?? undefined),
    ]);
    this.contadores.set(contadores);
    this.pedidos.set(pedidos);
    this.cargando.set(false);
  }

  async filtrarPor(grupo: EstadoUI | null) {
    this.filtro.set(grupo);
    this.mostrarCancelados.set(grupo === 'cancelado');
    await this.cargar();
  }
}
