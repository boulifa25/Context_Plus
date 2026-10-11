import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { CatalogueService } from '../data/catalogue.service';
import { ContactBand } from '../shared/contact-band';
import { Icon } from '../shared/icon';
import { ProductCard } from '../shared/product-card';

const PAGE = 24;

/** Catalogue : /products (tout), /catalogue/:category, /catalogue/:category/:sub ; recherche via ?q= */
@Component({
  selector: 'app-catalogue',
  imports: [RouterLink, ProductCard, ContactBand, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="intro container">
      @if (category(); as cat) {
        <nav class="crumbs" aria-label="Breadcrumb">
          <a routerLink="/">Home</a> / <a routerLink="/products">Catalogue</a> /
          @if (subcategory()) {
            <a [routerLink]="['/catalogue', cat.slug]">{{ cat.name }}</a> / <span>{{ subcategory()!.name }}</span>
          } @else {
            <span>{{ cat.name }}</span>
          }
        </nav>
      }
      <p class="eyebrow">{{ category() ? category()!.name : 'Products' }}</p>
      <h1 class="display">{{ subcategory()?.name ?? category()?.short ?? 'Products' }}</h1>
      <p class="lead">
        {{ category()?.intro ?? 'Product information, datasheets, certificates and brochures for the complete Context Plus fire safety catalogue.' }}
      </p>
    </section>

    <section class="layout container">
      <aside class="filters" aria-label="Product filters">
        <p class="filters__title">Product filters</p>
        <a routerLink="/products" class="filter" [class.filter--active]="!category()">
          All products <span>{{ catalogue.productCount }}</span>
        </a>
        @for (cat of catalogue.categories; track cat.slug) {
          <a [routerLink]="['/catalogue', cat.slug]" class="filter"
             [class.filter--active]="category()?.slug === cat.slug && !subcategory()">
            {{ cat.name }} <span>{{ cat.count }}</span>
          </a>
          @if (category()?.slug === cat.slug && cat.subcategories.length > 1) {
            <div class="subs">
              @for (s of cat.subcategories; track s.slug) {
                <a [routerLink]="['/catalogue', cat.slug, s.slug]" [class.active]="subcategory()?.slug === s.slug">
                  {{ s.name }} <span>{{ s.count }}</span>
                </a>
              }
            </div>
          }
        }
      </aside>

      <div class="results">
        <label class="sr-only" for="catalogue-search">Search the catalogue</label>
        <input id="catalogue-search" class="search" type="search" [value]="query()"
               placeholder="Search products, product codes or ranges" (input)="onSearch($any($event.target).value)" />
        <p class="count">
          {{ results().length }} {{ results().length === 1 ? 'product' : 'products' }}
          @if (query()) { matching “{{ query() }}” }
        </p>

        @if (results().length) {
          <div class="grid">
            @for (p of visible(); track p.slug; let i = $index) {
              <app-product-card [product]="p" [priority]="i < 3" />
            }
          </div>
          @if (visible().length < results().length) {
            <div class="more">
              <button type="button" class="btn" (click)="shown.set(shown() + PAGE)">
                Load more <span class="muted">({{ results().length - visible().length }} remaining)</span>
              </button>
            </div>
          }
        } @else {
          <div class="empty">
            <p class="h3">No products found.</p>
            <p class="muted">Try a product code (e.g. “XFP”, “Ei650”) or browse a range from the filters.</p>
            <a routerLink="/contact" class="link-arrow">Ask our sales team <app-icon name="chevron" /></a>
          </div>
        }
      </div>
    </section>

    <app-contact-band variant="compact" />
  `,
  styles: `
    .intro { display: grid; gap: 20px; padding-block: clamp(48px, 7vw, 96px) clamp(32px, 4vw, 56px); .lead { max-width: 640px; } }
    .crumbs { font-size: 14px; color: var(--muted); a:hover { color: var(--ink); } span { color: var(--ink); font-weight: 600; } }

    .layout { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: clamp(32px, 4vw, 64px); align-items: start; padding-bottom: var(--section-y); }
    .filters { position: sticky; top: calc(var(--header-h) + 24px); display: grid; gap: 10px; }
    .filters__title { margin-bottom: 6px; font-size: 14px; font-weight: 700; text-transform: uppercase; }
    .filter {
      display: flex; justify-content: space-between; gap: 12px;
      padding: 12px 16px;
      border: 1px solid var(--line); border-radius: var(--radius);
      font-size: 14px; font-weight: 600; line-height: 1.3;
      transition: border-color 0.2s;
      span { color: var(--muted); font-weight: 500; }
      &:hover { border-color: var(--ink-soft); }
      &--active { border-color: var(--ink); span { color: var(--ink); } }
    }
    .subs {
      display: grid; gap: 2px; margin: -2px 0 6px; padding: 6px 0 6px 14px;
      border-left: 2px solid var(--accent);
      a { display: flex; justify-content: space-between; gap: 8px; padding: 5px 8px; font-size: 13px; line-height: 1.35; color: var(--ink-soft); }
      a span { color: var(--muted); }
      a:hover, a.active { color: var(--accent); }
      a.active { font-weight: 700; }
    }

    .search {
      width: 100%; height: 54px; padding: 0 16px;
      border: 1px solid var(--ink-soft); border-radius: var(--radius); background: var(--paper-raised);
      font-size: 16px; outline: none;
      &:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
    }
    .count { margin: 22px 0 32px; font-size: 12px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(40px, 5vw, 64px) clamp(20px, 3vw, 36px); }
    .more { display: flex; justify-content: center; margin-top: 56px; .muted { text-transform: none; font-weight: 500; } }
    .empty { display: grid; gap: 12px; justify-items: start; padding: 48px 0; }

    @media (max-width: 1100px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 860px) {
      .layout { grid-template-columns: 1fr; }
      .filters { position: static; display: flex; overflow-x: auto; padding-bottom: 6px; }
      .filters__title, .subs { display: none; }
      .filter { flex: none; }
    }
    @media (max-width: 560px) { .grid { grid-template-columns: 1fr; } }
  `,
})
export class CataloguePage {
  protected readonly catalogue = inject(CatalogueService);
  private readonly router = inject(Router);
  protected readonly PAGE = PAGE;

  // Paramètres de route (withComponentInputBinding)
  readonly categorySlug = input<string>();
  readonly subSlug = input<string>();
  readonly q = input<string>();

  protected readonly query = linkedSignal(() => this.q() ?? '');
  protected readonly category = computed(() => this.catalogue.category(this.categorySlug()));
  protected readonly subcategory = computed(() => this.category()?.subcategories.find((s) => s.slug === this.subSlug()));

  protected readonly results = computed(() => {
    const cat = this.category();
    const sub = this.subcategory();
    const list = this.catalogue.products().filter(
      (p) => (!cat || p.category === cat.slug) && (!sub || p.subcategory === sub.slug),
    );
    return this.catalogue.search(this.query(), list);
  });
  protected readonly shown = linkedSignal({ source: this.results, computation: () => PAGE });
  protected readonly visible = computed(() => this.results().slice(0, this.shown()));

  constructor() {
    const title = inject(Title);
    const meta = inject(Meta);
    effect(() => {
      const cat = this.category();
      const sub = this.subcategory();
      const name = sub?.name ?? cat?.name ?? 'Product Catalogue';
      title.setTitle(`${name} | Context Plus`);
      meta.updateTag({
        name: 'description',
        content: cat?.intro ?? 'Browse the complete Context Plus catalogue of fire detection, alarm and suppression products.',
      });
    });
  }

  protected onSearch(value: string): void {
    this.query.set(value);
    this.router.navigate([], { queryParams: { q: value.trim() || null }, queryParamsHandling: 'merge', replaceUrl: true });
  }
}
