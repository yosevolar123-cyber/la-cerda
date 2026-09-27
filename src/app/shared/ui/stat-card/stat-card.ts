import { Component, input } from '@angular/core';
import { Icon } from '../icon/icon';
import type { IconName } from '../icon/icon-paths';

export type StatTono = 'primario' | 'secundario' | 'exito' | 'alerta' | 'rosa';

/**
 * Tarjeta de estadística compartida (dashboards de admin y secretaria):
 * ícono con fondo de tono, cifra grande, etiqueta y variación opcional.
 * `activa` la resalta cuando además funciona como filtro.
 */
@Component({
  selector: 'app-stat-card',
  imports: [Icon],
  template: `
    <div [class]="'stat stat--' + tono()" [class.stat--activa]="activa()">
      <span class="stat__icono"><app-icon [name]="icono()" [size]="20" /></span>
      <span class="stat__etiqueta">{{ etiqueta() }}</span>
      <span class="stat__valor">{{ valor() }}</span>
      @if (variacion() !== null) {
        <span class="stat__delta" [class.stat__delta--baja]="variacion()! < 0">
          {{ variacion()! >= 0 ? '▲' : '▼' }} {{ variacionTexto() }}
        </span>
      }
    </div>
  `,
  styleUrl: './stat-card.scss',
})
export class StatCard {
  icono = input.required<IconName>();
  etiqueta = input.required<string>();
  valor = input.required<string | number>();
  tono = input<StatTono>('primario');
  /** Porcentaje de variación; null = no mostrar. */
  variacion = input<number | null>(null);
  referencia = input('');
  activa = input(false);

  variacionTexto() {
    const v = this.variacion();
    if (v === null) return '';
    return `${Math.abs(v).toFixed(0)}% ${this.referencia()}`.trim();
  }
}
