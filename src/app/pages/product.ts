import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { CatalogueService } from '../data/catalogue.service';
import type { DocumentType, Product } from '../data/models';
import { SITE } from '../site.config';
import { ContactBand } from '../shared/contact-band';
import { Icon } from '../shared/icon';
import { Badges } from '../shared/badges';
import { ProductCard } from '../shared/product-card';
import { ProductVisual } from '../shared/product-visual';
import { Reveal } from '../shared/reveal.directive';

const DOC_LABELS: Record<DocumentType, string> = {
  datasheet: 'Datasheet',
  certificate: 'Certificate',
  brochure: 'Brochure',
  manual: 'Manual',
};

@Component({
  selector: 'app-product',
  imports: [RouterLink, Icon, ProductCard, ProductVisual, Badges, ContactBand, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product.html',
  styleUrl: './product.scss',
})
export class ProductPage {
  readonly product = input.required<Product>();
  private readonly catalogue = inject(CatalogueService);
  protected readonly docLabels = DOC_LABELS;

  protected readonly activeImage = linkedSignal(() => this.product().images[0] ?? null);
  protected readonly related = computed(() =>
    this.product().related.map((slug) => this.catalogue.summary(slug)).filter((p) => !!p),
  );
  protected readonly mainDoc = computed(
    () => this.product().documents.find((d) => d.type === 'datasheet') ?? this.product().documents[0] ?? null,
  );
  protected readonly hasTechnical = computed(() => this.product().specs.length > 0 || this.product().features.length > 0);
  protected readonly sections = computed(() =>
    [
      { id: 'overview', label: 'Overview', show: true },
      { id: 'technical', label: 'Technical', show: this.hasTechnical() },
      { id: 'documents', label: 'Documents', show: this.product().documents.length > 0 },
      { id: 'related', label: 'Related products', show: this.related().length > 0 },
    ].filter((s) => s.show),
  );

  constructor() {
    const title = inject(Title);
    const meta = inject(Meta);
    const doc = inject(DOCUMENT);
    effect(() => {
      const p = this.product();
      const desc = p.summary.slice(0, 160);
      title.setTitle(`${p.name}${p.codes[0] ? ` (${p.codes[0]})` : ''} | Context Plus`);
      meta.updateTag({ name: 'description', content: desc });
      meta.updateTag({ property: 'og:title', content: p.name });
      meta.updateTag({ property: 'og:description', content: desc });
      if (p.images[0]) meta.updateTag({ property: 'og:image', content: SITE.url + p.images[0].src });

      // Données structurées schema.org/Product pour le référencement
      let ld = doc.getElementById('product-ld');
      if (!ld) {
        ld = doc.createElement('script');
        ld.id = 'product-ld';
        ld.setAttribute('type', 'application/ld+json');
        doc.head.appendChild(ld);
      }
      ld.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: p.name,
        sku: p.codes[0],
        mpn: p.codes[0],
        description: p.summary,
        image: p.images.map((i) => SITE.url + i.src),
        brand: { '@type': 'Brand', name: SITE.name },
        category: p.category.name,
      });
    });
  }

  protected formatSize(bytes: number): string {
    return bytes > 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1e3))} KB`;
  }
}
