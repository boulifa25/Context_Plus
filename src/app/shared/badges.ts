import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Badges de certification (LPCB, UL, FM, VdS, EN54-x…). */
@Component({
  selector: 'app-badges',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (shown().length) {
      <ul [attr.aria-label]="'Approvals: ' + badges().join(', ')">
        @for (b of shown(); track b) {
          <li [class.major]="!b.startsWith('EN')">{{ b }}</li>
        }
        @if (hidden() > 0) {
          <li class="more" aria-hidden="true">+{{ hidden() }}</li>
        }
      </ul>
    }
  `,
  styles: `
    ul { display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; list-style: none; }
    li {
      padding: 3px 8px;
      border: 1px solid var(--line-strong);
      border-radius: 999px;
      color: var(--ink-soft);
      font-size: 11px; font-weight: 700; letter-spacing: 0.06em; line-height: 1.4;
    }
    li.major { border-color: var(--accent); background: var(--accent-soft); color: var(--accent); }
    li.more { border-style: dashed; color: var(--muted); }
  `,
})
export class Badges {
  readonly badges = input<string[]>([]);
  /** Nombre max affiché (0 = tous) */
  readonly max = input(0);
  protected readonly shown = computed(() => (this.max() ? this.badges().slice(0, this.max()) : this.badges()));
  protected readonly hidden = computed(() => this.badges().length - this.shown().length);
}
