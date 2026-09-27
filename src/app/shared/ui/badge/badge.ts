import { Component, input } from '@angular/core';

export type BadgeTone = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';

@Component({
  selector: 'app-badge',
  template: `
    <span class="badge" [class]="'badge--' + tone() + (stamp() ? ' badge--stamp' : '')">
      <ng-content></ng-content>
    </span>
  `,
  styleUrl: './badge.scss',
})
export class Badge {
  tone = input<BadgeTone>('neutral');
  /** Renders as a rotated dashed "sello" stamp — for stock/status callouts. */
  stamp = input(false);
}
