import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE } from '../site.config';
import { Icon } from './icon';
import { Reveal } from './reveal.directive';

/**
 * Bloc d'appel au contact.
 *  - variant "full"    : grand titre + coordonnées (accueil)
 *  - variant "compact" : « Let's work together » + boutons (pages produit)
 */
@Component({
  selector: 'app-contact-band',
  imports: [RouterLink, Icon, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="band container" [class.band--compact]="variant() === 'compact'" appReveal>
      <div class="band__text">
        <p class="eyebrow">{{ variant() === 'full' ? 'Contact us' : 'Support' }}</p>
        @if (variant() === 'full') {
          <h2 class="h2">Interested in working together?</h2>
          <p class="lead">Send us your project details and one of our export sales managers will get back to you within one working day.</p>
          <a routerLink="/contact" class="btn btn--primary">Send an enquiry <app-icon name="chevron" /></a>
        } @else {
          <h2 class="h3">Need help choosing the right product?</h2>
          <p class="lead">Our technical sales team supports installers and distributors in over {{ site.countries }} countries.</p>
        }
      </div>

      @if (variant() === 'full') {
        <dl class="band__info">
          <div class="org">{{ site.legalName }}</div>
          <div><dt>Location</dt><dd>@for (l of site.address; track l) { {{ l }}<br /> }</dd></div>
          <div><dt>Email</dt><dd><a [href]="'mailto:' + site.email">{{ site.email }}</a></dd></div>
          <div><dt>Phone</dt><dd><a [href]="'tel:' + site.phoneHref">{{ site.phone }}</a></dd></div>
        </dl>
      } @else {
        <div class="band__actions">
          <a routerLink="/contact" class="btn btn--primary btn--sm">Contact us <app-icon name="chevron" [size]="13" /></a>
          <a [href]="'mailto:' + site.email" class="btn btn--sm">{{ site.email }} <app-icon name="chevron" [size]="13" /></a>
          <a [href]="'tel:' + site.phoneHref" class="btn btn--sm">{{ site.phone }} <app-icon name="chevron" [size]="13" /></a>
        </div>
      }
    </section>
  `,
  styles: `
    :host { display: block; }
    .band {
      display: grid;
      grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
      gap: clamp(32px, 6vw, 96px);
      align-items: start;
      padding-block: var(--section-y);
      border-top: 1px solid var(--line);
    }
    .band__text { display: grid; gap: 18px; justify-items: start; max-width: 720px; .btn { margin-top: 10px; } }
    .band__info {
      margin: 0;
      display: grid;
      gap: 20px;
      .org { font-size: 18px; font-weight: 600; }
      dt { color: var(--muted); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
      dd { margin: 6px 0 0; font-weight: 600; line-height: 1.5; }
      a:hover { color: var(--accent); }
    }
    .band--compact { align-items: center; }
    .band__actions { display: flex; flex-wrap: wrap; gap: 12px; }
    @media (max-width: 860px) { .band { grid-template-columns: 1fr; } }
  `,
})
export class ContactBand {
  readonly variant = input<'full' | 'compact'>('full');
  protected readonly site = SITE;
}
