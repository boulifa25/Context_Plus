import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Bandeau défilant d'arguments (« UK MANUFACTURED • 70+ COUNTRIES … »). */
@Component({
  selector: 'app-marquee',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="marquee" role="presentation">
      <!-- Deux copies identiques : la piste se décale de 50 % pour boucler sans saut. -->
      <div class="track">
        @for (copy of [0, 1]; track copy) {
          <ul [attr.aria-hidden]="copy === 1 ? 'true' : null">
            @for (rep of [0, 1, 2]; track rep) {
              @for (item of items(); track item) {
                <li>{{ item }}</li>
              }
            }
          </ul>
        }
      </div>
    </div>
  `,
  styles: `
    .marquee {
      overflow: hidden;
      border-block: 1px solid var(--line);
      mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
    }
    .track { display: flex; width: max-content; animation: scroll 38s linear infinite; }
    .marquee:hover .track { animation-play-state: paused; }
    ul { display: flex; margin: 0; padding: 0; list-style: none; }
    li {
      display: flex; align-items: center; gap: 12px;
      padding: 15px 30px;
      font-size: 12px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; white-space: nowrap;
      &::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }
    }
    @keyframes scroll { to { transform: translateX(-50%); } }
  `,
})
export class Marquee {
  readonly items = input.required<string[]>();
}
