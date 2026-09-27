import {
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import {
  DashboardAdminService,
  EstadisticasAdmin,
  PuntoSerieVentas,
  variacionPorcentual,
} from '../../../core/admin/dashboard-admin.service';
import { Card } from '../../../shared/ui/card/card';
import { Icon } from '../../../shared/ui/icon/icon';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { StatCard } from '../../../shared/ui/stat-card/stat-card';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  imports: [Card, RouterLink, Icon, PageHeader, StatCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardAdmin implements OnInit {
  private dashboardSvc = inject(DashboardAdminService);
  private destroyRef = inject(DestroyRef);
  private canvasVentas = viewChild<ElementRef<HTMLCanvasElement>>('canvasVentas');

  stats = signal<EstadisticasAdmin | null>(null);
  cargando = signal(true);
  serieVentas = signal<PuntoSerieVentas[] | null>(null);

  /** Menos de 2 días con ventas reales: un gráfico no aporta nada — se muestra un estado vacío. */
  hayDatosParaGraficar = signal(false);

  variacion = variacionPorcentual;
  private chart: Chart | null = null;

  constructor() {
    // effect() reacciona a la vez al <canvas> (aparece recién cuando stats()
    // deja de ser null) y a los datos de la serie — sea cual sea el orden en
    // que lleguen, el gráfico se crea en cuanto ambos existen. El bug anterior
    // llamaba a Chart.js justo después de un signal.set(), en el mismo tick,
    // antes de que Angular insertara el <canvas> en el DOM — nunca se creaba.
    effect(() => {
      const canvas = this.canvasVentas()?.nativeElement;
      const serie = this.serieVentas();
      if (!canvas || !serie || !this.hayDatosParaGraficar() || this.chart) return;
      this.dibujarGrafico(canvas, serie);
    });

    this.destroyRef.onDestroy(() => this.chart?.destroy());
  }

  async ngOnInit() {
    const [stats, serie] = await Promise.all([
      this.dashboardSvc.obtenerEstadisticas(),
      this.dashboardSvc.serieVentasDiarias(14),
    ]);
    this.stats.set(stats);
    this.cargando.set(false);
    this.serieVentas.set(serie);
    this.hayDatosParaGraficar.set(serie.filter((p) => p.total > 0).length >= 2);
  }

  private dibujarGrafico(canvas: HTMLCanvasElement, serie: PuntoSerieVentas[]) {
    const estiloComputado = getComputedStyle(document.documentElement);
    const colorPrimario = estiloComputado.getPropertyValue('--color-primary').trim();
    const colorTexto = estiloComputado.getPropertyValue('--color-text-muted').trim();

    // Relleno degradado violeta → transparente bajo la línea.
    const ctx = canvas.getContext('2d')!;
    const relleno = ctx.createLinearGradient(0, 0, 0, canvas.clientHeight || 256);
    relleno.addColorStop(0, 'rgba(127, 72, 155, 0.28)');
    relleno.addColorStop(1, 'rgba(247, 191, 190, 0)');

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: serie.map((p) => p.fecha.slice(5).replace('-', '/')),
        datasets: [
          {
            label: 'Ventas (Bs)',
            data: serie.map((p) => p.total),
            borderColor: colorPrimario,
            backgroundColor: relleno,
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: colorPrimario,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        animation: { duration: 900, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: colorPrimario,
            padding: 10,
            cornerRadius: 10,
            displayColors: false,
            callbacks: { label: (item) => `Bs ${Number(item.parsed.y).toFixed(2)}` },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: 'rgba(83, 33, 94, 0.06)' },
            ticks: { color: colorTexto, callback: (v) => `Bs ${v}` },
          },
          x: {
            border: { display: false },
            grid: { display: false },
            ticks: { color: colorTexto, maxRotation: 0, autoSkipPadding: 12 },
          },
        },
      },
    });
  }
}
