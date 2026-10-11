import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogueService } from '../data/catalogue.service';
import type { ProductSummary } from '../data/models';
import { Badges } from './badges';
import { Icon } from './icon';
import { ProductVisual } from './product-visual';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, Icon, Badges, ProductVisual],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let p = product();
    <article class="card" (pointerenter)="prefetch()" (focusin)="prefetch()" (touchstart)="prefetch()">
      <a [routerLink]="['/products', p.slug]" class="card__media" tabindex="-1" aria-hidden="true">
        <app-product-visual [image]="p.image" [category]="p.category" [transitionName]="'p-' + p.slug" [eager]="priority()" />
        @if (p.docs) {
          <span class="docs">{{ p.docs }} {{ p.docs > 1 ? 'documents' : 'document' }}</span>
        }
      </a>
      <p class="eyebrow eyebrow--dash">{{ categoryName() }}</p>
      <h3 class="card__title"><a [routerLink]="['/products', p.slug]">{{ p.name }}</a></h3>
      @if (p.subtitle) {
        <p class="card__subtitle">{{ p.subtitle }}</p>
      }
      <app-badges [badges]="p.badges" [max]="4" />
      <p class="card__excerpt">{{ p.excerpt }}</p>
      <div class="card__foot">
        <div class="chips">
          @for (code of p.codes.slice(0, 2); track code) {
            <span class="chip">{{ code }}</span>
          }
        </div>
        <a [routerLink]="['/products', p.slug]" class="link-arrow">View details <app-icon name="chevron" /></a>
      </div>
    </article>
  `,
  styles: `
    :host { display: block; }
    .card { display: flex; flex-direction: column; height: 100%; }
    .card__media {
      position: relative;
      display: block;
      aspect-ratio: 4 / 3;
      margin-bottom: 24px;
      app-product-visual { transition: transform 0.6s var(--ease); }
      &:hover app-product-visual { transform: scale(1.04); }
    }
    .docs {
      position: absolute; top: 0; right: 0;
      font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
    }
    .eyebrow { font-size: 11px; }
    .card__title {
      margin: 12px 0 0;
      font-size: 20px; font-weight: 600; line-height: 1.25; letter-spacing: -0.01em;
      display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
      a:hover { color: var(--accent); }
    }
    .card__subtitle {
      margin-top: 6px;
      color: var(--muted); font-size: 14px; line-height: 1.45;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    app-badges { margin-top: 12px; }
    .card__excerpt {
      margin-top: 12px;
      color: var(--ink-soft); font-size: 15px; line-height: 1.55;
      display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
    }
    .card__foot {
      display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px;
      margin-top: auto; padding-top: 20px;
    }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; min-width: 0; }
    .chip { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  `,
})
export class ProductCard {
  readonly product = input.required<ProductSummary>();
  /** Carte visible dès l'ouverture : image chargée en priorité (meilleur LCP) */
  readonly priority = input(false);
  private readonly catalogue = inject(CatalogueService);
  protected readonly categoryName = computed(() => this.catalogue.category(this.product().category)?.name ?? '');

  /** Survol / focus : la fiche et sa photo sont prêtes avant le clic. */
  protected prefetch(): void {
    this.catalogue.prefetch(this.product().slug);
  }
}
