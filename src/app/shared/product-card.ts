import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogueService } from '../data/catalogue.service';
import type { ProductSummary } from '../data/models';
import { Icon } from './icon';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let p = product();
    <article class="card">
      <a [routerLink]="['/products', p.slug]" class="card__media" tabindex="-1" aria-hidden="true">
        @if (p.image; as img) {
          <img class="product-img" [src]="img.src" [width]="img.width" [height]="img.height" alt="" loading="lazy" decoding="async" />
        } @else {
          <span class="placeholder">
            <img src="brand/contextplus-logo.png" alt="" width="300" height="178" loading="lazy" />
          </span>
        }
        @if (p.docs) {
          <span class="docs">{{ p.docs }} {{ p.docs > 1 ? 'documents' : 'document' }}</span>
        }
      </a>
      <p class="eyebrow eyebrow--dash">{{ categoryName() }}</p>
      <h3 class="card__title"><a [routerLink]="['/products', p.slug]">{{ p.name }}</a></h3>
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
      display: grid;
      place-items: center;
      aspect-ratio: 4 / 3;
      margin-bottom: 24px;
      background: var(--paper); /* fond opaque : sinon le multiply est isolé par l'animation */
      img { max-height: 100%; width: auto; transition: transform 0.6s var(--ease); }
      &:hover img { transform: scale(1.04); }
    }
    .placeholder {
      display: grid; place-items: center; width: 100%; height: 100%;
      border: 1px dashed var(--line-strong); border-radius: var(--radius);
      img { width: 38%; opacity: 0.35; filter: grayscale(1); }
    }
    .docs {
      position: absolute; top: 0; right: 0;
      font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
    }
    .eyebrow { font-size: 11px; }
    .card__title {
      margin: 12px 0 10px;
      font-size: 20px; font-weight: 600; line-height: 1.25; letter-spacing: -0.01em;
      display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
      a:hover { color: var(--accent); }
    }
    .card__excerpt {
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
  private readonly catalogue = inject(CatalogueService);
  protected readonly categoryName = computed(() => this.catalogue.category(this.product().category)?.name ?? '');
}
