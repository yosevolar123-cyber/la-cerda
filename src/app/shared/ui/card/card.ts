import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  template: `
    <div class="card" [class.card--interactive]="interactive()">
      <ng-content></ng-content>
    </div>
  `,
  styleUrl: './card.scss',
})
export class Card {
  /** Adds hover affordance for clickable cards (e.g. product cards). */
  interactive = input(false);
}
