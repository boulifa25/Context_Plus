import { Injectable, inject, signal } from '@angular/core';
import { ResolveFn } from '@angular/router';
import categoriesData from './generated/categories.json';
import downloadsData from './generated/downloads.json';
import stats from './generated/stats.json';
import { PRODUCT_LOADERS } from './generated/product-loaders';
import type { Category, DownloadGroup, Product, ProductSummary } from './models';

const CATEGORIES = categoriesData as Category[];
const DOWNLOADS = downloadsData as DownloadGroup[];

interface CatalogueIndex {
  products: ProductSummary[];
  featured: string[];
}

/**
 * Données du catalogue.
 *  - catégories et téléchargements (≈ 12 Ko) : embarqués, utilisés par l'en-tête et le pied de page ;
 *  - index des produits (≈ 170 Ko) : chargé à la demande (resolver `catalogueIndexResolver`) ;
 *  - fiches complètes : un petit fichier par produit, chargé à l'ouverture de la fiche.
 */
@Injectable({ providedIn: 'root' })
export class CatalogueService {
  readonly categories = CATEGORIES;
  readonly navCategories = CATEGORIES.filter((c) => !c.hidden);
  readonly downloads = DOWNLOADS;
  readonly productCount = CATEGORIES.reduce((n, c) => n + c.count, 0);
  /** Nombre de PDF publiés (fiches techniques, certificats, manuels, brochures) */
  readonly documentCount = stats.documents;

  private readonly index = signal<CatalogueIndex | null>(null);
  private indexPromise?: Promise<CatalogueIndex>;
  private readonly productCache = new Map<string, Promise<Product | null>>();

  /** Index des produits (vide tant qu'il n'est pas chargé ; les routes qui l'utilisent le résolvent). */
  products(): ProductSummary[] {
    return this.index()?.products ?? [];
  }

  featured(): ProductSummary[] {
    const idx = this.index();
    return idx ? idx.featured.map((slug) => this.summary(slug)).filter((p) => !!p) : [];
  }

  loadIndex(): Promise<CatalogueIndex> {
    this.indexPromise ??= import('./generated/index.json').then((m) => {
      const data = m.default as unknown as CatalogueIndex;
      this.index.set(data);
      return data;
    });
    return this.indexPromise;
  }

  category(slug: string | null | undefined): Category | undefined {
    return CATEGORIES.find((c) => c.slug === slug);
  }

  summary(slug: string): ProductSummary | undefined {
    return this.products().find((p) => p.slug === slug);
  }

  /** Fiche complète (mise en cache : un survol de carte la précharge). */
  product(slug: string): Promise<Product | null> {
    let p = this.productCache.get(slug);
    if (!p) {
      const load = PRODUCT_LOADERS[slug];
      p = load ? load() : Promise.resolve(null);
      this.productCache.set(slug, p);
    }
    return p;
  }

  /** Précharge la fiche et sa photo principale (survol / focus d'une carte). */
  prefetch(slug: string): void {
    if (typeof window === 'undefined' || this.productCache.has(slug)) return;
    this.product(slug).then((p) => {
      const img = p?.images[0];
      if (img) new Image().src = img.src;
    });
  }

  /** Recherche plein texte simple sur nom, codes, sous-titre, badges, famille et extrait. */
  search(query: string, list: ProductSummary[] = this.products()): ProductSummary[] {
    const terms = normalize(query).split(' ').filter(Boolean);
    if (!terms.length) return list;
    return list
      .map((p) => {
        const name = normalize(p.name);
        const codes = normalize(p.codes.join(' '));
        const rest = normalize(`${p.subtitle} ${p.badges.join(' ')} ${p.family ?? ''} ${p.excerpt}`);
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

/** À placer sur les routes qui affichent des cartes produits (accueil, catalogue, fiche). */
export const catalogueIndexResolver: ResolveFn<boolean> = () =>
  inject(CatalogueService)
    .loadIndex()
    .then(() => true);

function normalize(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
