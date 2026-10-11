import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ProductImage } from '../data/models';

/**
 * Visuel produit homogène :
 *  - photo détourée (fond transparent) + ombre portée douce
 *  - photo d'origine fondue dans le papier (multiply)
 *  - sinon illustration de la gamme
 */
@Component({
  selector: 'app-product-visual',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.cutout]': 'image()?.cutout', '[style.view-transition-name]': 'transitionName()' },
  template: `
    @if (image(); as img) {
      <img [src]="img.src" [attr.srcset]="img.srcset" [attr.sizes]="sizes()" [width]="img.width" [height]="img.height" [alt]="alt()"
           [attr.loading]="eager() ? null : 'lazy'" [attr.fetchpriority]="eager() ? 'high' : null" decoding="async" />
    } @else {
      <span class="placeholder">
        <img [src]="'brand/placeholders/' + category() + '.svg'" alt="" width="240" height="180" loading="lazy" />
        <span>Photo coming soon</span>
      </span>
    }
  `,
  styles: `
    :host {
      display: grid;
      place-items: center;
      width: 100%;
      height: 100%;
      background: var(--paper);
    }
    img { max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; mix-blend-mode: multiply; }
    :host(.cutout) img { mix-blend-mode: normal; filter: drop-shadow(0 18px 22px rgba(30, 26, 60, 0.14)); }
    .placeholder {
      display: grid; place-items: center; gap: 6px; width: 100%; height: 100%;
      border-radius: var(--radius);
      background: linear-gradient(160deg, var(--accent-soft), transparent 70%);
      color: var(--muted); font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
      img { width: 58%; mix-blend-mode: normal; opacity: 0.9; }
    }
  `,
})
export class ProductVisual {
  readonly image = input<ProductImage | null>(null);
  readonly category = input.required<string>();
  readonly alt = input('');
  readonly eager = input(false);
  /** Largeur d'affichage, pour que le navigateur choisisse la variante 480 px ou 1000 px */
  readonly sizes = input('(max-width: 600px) 92vw, (max-width: 1100px) 45vw, 360px');
  /** Nom pour la transition animée carte -> fiche produit */
  readonly transitionName = input<string | null>(null);
}
