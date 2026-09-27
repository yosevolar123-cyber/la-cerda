import { Component, DestroyRef, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PedidosService } from '../../core/catalogo/pedidos.service';
import { estadoUI } from '../../core/models/estado-pedido';
import { Button } from '../../shared/ui/button/button';

const INTERVALO_ACTUALIZACION_MS = 20_000;

@Component({
  selector: 'app-seguimiento',
  imports: [Button, DatePipe, RouterLink],
  templateUrl: './seguimiento.html',
  styleUrl: './seguimiento.scss',
})
export class Seguimiento implements OnInit {
  private route = inject(ActivatedRoute);
  private pedidosSvc = inject(PedidosService);
  private destroyRef = inject(DestroyRef);

  pedido = signal<Awaited<ReturnType<PedidosService['obtenerPedidoConEnvio']>> | null>(null);
  cargando = signal(true);
  marcando = signal(false);
  ahora = signal(Date.now());

  grupo = computed(() => {
    const p = this.pedido();
    return p ? estadoUI(p.estado) : null;
  });

  fechaEstimada = computed(() => {
    const p = this.pedido();
    const envio = p && (Array.isArray(p.envios) ? p.envios[0] : p.envios);
    return envio?.fecha_estimada ?? null;
  });

  yaLlegoLaHora = computed(() => {
    const fecha = this.fechaEstimada();
    if (!fecha) return true; // sin fecha estimada: no hay nada que esperar, se puede confirmar recepción
    return this.ahora() >= new Date(fecha).getTime();
  });

  private pedidoId = '';

  async ngOnInit() {
    this.pedidoId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.pedidoId) return;
    await this.cargar();

    const intervalo = setInterval(() => {
      this.ahora.set(Date.now());
      const grupo = this.grupo();
      if (grupo === 'pendiente' || grupo === 'enviado') this.cargar();
    }, INTERVALO_ACTUALIZACION_MS);
    this.destroyRef.onDestroy(() => clearInterval(intervalo));
  }

  private async cargar() {
    this.pedido.set(await this.pedidosSvc.obtenerPedidoConEnvio(this.pedidoId));
    this.cargando.set(false);
  }

  async marcarRecibido() {
    this.marcando.set(true);
    try {
      await this.pedidosSvc.marcarRecibido(this.pedidoId);
      await this.cargar();
    } finally {
      this.marcando.set(false);
    }
  }
}
