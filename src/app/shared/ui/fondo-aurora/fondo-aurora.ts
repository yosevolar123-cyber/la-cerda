import { Component } from '@angular/core';

/**
 * Fondo global de la app: manchas difuminadas violeta/rosa/lavanda que
 * derivan muy lentamente + una textura de puntos que se desvanece hacia los
 * bordes. Se monta una sola vez en el shell (app.html). Puramente decorativo:
 * aria-hidden, sin eventos, detrás de todo. prefers-reduced-motion lo congela
 * en una versión estática (regla global de _base.scss).
 */
@Component({
  selector: 'app-fondo-aurora',
  template: `
    <div class="aurora" aria-hidden="true">
      <span class="aurora__mancha aurora__mancha--1"></span>
      <span class="aurora__mancha aurora__mancha--2"></span>
      <span class="aurora__mancha aurora__mancha--3"></span>
      <span class="aurora__mancha aurora__mancha--4"></span>
    </div>
    <div class="puntos" aria-hidden="true"></div>
  `,
  styleUrl: './fondo-aurora.scss',
})
export class FondoAurora {}
