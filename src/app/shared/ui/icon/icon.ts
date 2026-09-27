import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ICON_PATHS, type IconName } from './icon-paths';

/**
 * Un solo set de íconos para toda la app (fase E) — antes se mezclaban
 * emojis (🛒 ✕ 🗑 ✓) con texto. Estilo lucide (trazo, 24×24, stroke-width 2).
 * El SVG interno es siempre contenido propio y estático (ver icon-paths.ts),
 * nunca datos de usuario — bypassSecurityTrustHtml es seguro aquí.
 */
@Component({
  selector: 'app-icon',
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      [innerHTML]="markup()"
    ></svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        line-height: 0;
      }
    `,
  ],
})
export class Icon {
  private sanitizer = inject(DomSanitizer);

  name = input.required<IconName>();
  size = input(20);

  protected markup = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(ICON_PATHS[this.name()]),
  );
}
