import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Encabezado único para todas las pantallas internas (secretaria, admin,
 * cliente logueado): enlace "volver" opcional, título, subtítulo corto de
 * instrucción y un espacio a la derecha para acciones (<ng-content>).
 * Así todos los títulos quedan en la misma posición y con el mismo ritmo.
 */
@Component({
  selector: 'app-page-header',
  imports: [RouterLink],
  template: `
    <header class="ph">
      @if (volverRuta()) {
        <a class="ph__volver" [routerLink]="volverRuta()">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {{ volverTexto() }}
        </a>
      }
      <div class="ph__fila">
        <div class="ph__textos">
          <h1 class="ph__titulo">{{ titulo() }}</h1>
          @if (subtitulo()) {
            <p class="ph__subtitulo">{{ subtitulo() }}</p>
          }
        </div>
        <div class="ph__acciones">
          <ng-content />
        </div>
      </div>
    </header>
  `,
  styleUrl: './page-header.scss',
})
export class PageHeader {
  titulo = input.required<string>();
  subtitulo = input<string | null>(null);
  volverRuta = input<string | null>(null);
  volverTexto = input('Volver');
}
