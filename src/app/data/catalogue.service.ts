import { Injectable } from '@angular/core';
import categoriesData from './generated/categories.json';
import downloadsData from './generated/downloads.json';
import indexData from './generated/index.json';
import { PRODUCT_LOADERS } from './generated/product-loaders';
import type { Category, DownloadGroup, Product, ProductSummary } from './models';

const CATEGORIES = categoriesData as Category[];
const PRODUCTS = indexData.products as ProductSummary[];
const DOWNLOADS = downloadsData as DownloadGroup[];

/** Données du catalogue : l'index est embarqué, les fiches complètes sont chargées à la demande. */
@Injectable({ providedIn: 'root' })
export class CatalogueService {
  readonly categories = CATEGORIES;
  readonly navCategories = CATEGORIES.filter((c) => !c.hidden);
  readonly products = PRODUCTS;
  readonly downloads = DOWNLOADS;
  readonly featured = indexData.featured.map((slug) => this.summary(slug)).filter((p) => !!p);
  readonly documentCount = new Set(
    [...DOWNLOADS.flatMap((g) => g.documents)].map((d) => d.url),
  ).size;

  category(slug: string | null | undefined): Category | undefined {
    return CATEGORIES.find((c) => c.slug === slug);
  }

  summary(slug: string): ProductSummary | undefined {
    return PRODUCTS.find((p) => p.slug === slug);
  }

  product(slug: string): Promise<Product | null> {
    const load = PRODUCT_LOADERS[slug];
    return load ? load() : Promise.resolve(null);
  }

  /** Recherche plein texte simple sur nom, codes, famille et extrait. */
  search(query: string, list: ProductSummary[] = PRODUCTS): ProductSummary[] {
    const terms = normalize(query).split(' ').filter(Boolean);
    if (!terms.length) return list;
    return list
      .map((p) => {
        const name = normalize(p.name);
        const codes = normalize(p.codes.join(' '));
        const rest = normalize(`${p.family ?? ''} ${p.excerpt}`);
        let score = 0;
        for (const t of terms) {
          if (codes.includes(t)) score += 5;
          else if (name.includes(t)) score += 3;
          else if (rest.includes(t)) score += 1;
          else return { p, score: 0 };
        }
        return { p, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.p);
  }
}

function normalize(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
