import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogueService } from '../data/catalogue.service';
import { SITE } from '../site.config';
import { ContactBand } from '../shared/contact-band';
import { Icon } from '../shared/icon';
import { Marquee } from '../shared/marquee';
import { ProductCard } from '../shared/product-card';
import { Reveal } from '../shared/reveal.directive';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Icon, Marquee, ProductCard, ContactBand, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Hero -->
    <section class="hero container">
      <img class="hero__logo" src="brand/contextplus-logo.png" alt="" width="300" height="178" />
      <h1 class="h1">Fire Detection & Suppression Systems, Made in the UK</h1>
      <p class="lead">
        Since {{ site.founded }}, Context Plus has manufactured certified fire alarm, detection and suppression products
        in Great Britain and Ireland, trusted by installers and distributors in over {{ site.countries }} countries.
      </p>
      <div class="hero__actions">
        <a routerLink="/products" class="btn btn--primary">See our full range of products <app-icon name="chevron" /></a>
        <a routerLink="/about" class="btn">About our company <app-icon name="chevron" /></a>
      </div>
    </section>

    <app-marquee [items]="marquee" />

    <!-- À propos -->
    <section class="about section">
      <div class="container about__grid">
        <div appReveal>
          <p class="eyebrow">About our company</p>
          <h2 class="display">Context Plus</h2>
          <p class="about__tag">The UK's largest exporter of conventional fire detection systems.</p>
        </div>
        <div class="about__text" appReveal="p, a">
          <p>
            Established in Manchester in {{ site.founded }}, Context Plus designs and supplies a complete range of wired and
            wireless fire alarm systems for commercial, industrial and domestic use — from conventional and analogue
            addressable panels to clean agent suppression and fire resistant cables.
          </p>
          <p>
            Every product is manufactured in Great Britain and Ireland and independently approved by internationally
            recognised bodies such as UL, LPCB, BSI and Intertek, so our systems work seamlessly together.
          </p>
          <p>
            With distributors and sales agents across Europe, Africa, the Middle East and Asia, we combine competitive
            pricing with dependable delivery, full manuals and training for our partners.
          </p>
          <a routerLink="/about" class="btn btn--sm btn--block">Learn more <app-icon name="chevron" [size]="13" /></a>
        </div>
      </div>
    </section>

    <!-- Gammes -->
    <section class="section container">
      <div class="head" appReveal>
        <p class="eyebrow">Product ranges</p>
        <h2 class="h2">Complete fire safety systems</h2>
      </div>
      <ul class="ranges" appReveal="li">
        @for (cat of catalogue.navCategories; track cat.slug; let i = $index) {
          <li>
            <a [routerLink]="['/catalogue', cat.slug]" class="range">
              <span class="range__num">{{ (i + 1).toString().padStart(2, '0') }}</span>
              <span class="range__body">
                <span class="range__name">{{ cat.name }}</span>
                <span class="range__intro">{{ cat.intro }}</span>
              </span>
              <span class="range__count">{{ cat.count }} products <app-icon name="chevron" /></span>
            </a>
          </li>
        }
      </ul>
    </section>

    <!-- Produits mis en avant -->
    <section class="section container">
      <div class="head head--row" appReveal>
        <div>
          <p class="eyebrow">Products</p>
          <h2 class="h2">Featured Products</h2>
        </div>
        <a routerLink="/products" class="link-arrow">View all {{ catalogue.products.length }} products <app-icon name="chevron" /></a>
      </div>
      <div class="grid" appReveal="app-product-card">
        @for (p of catalogue.featured; track p.slug) {
          <app-product-card [product]="p" />
        }
      </div>
    </section>

    <app-contact-band />
  `,
  styles: `
    .hero {
      display: grid;
      justify-items: center;
      gap: 28px;
      padding-block: clamp(56px, 9vw, 120px);
      text-align: center;
      .h1 { max-width: 900px; }
      .lead { max-width: 680px; }
    }
    .hero__logo { width: clamp(180px, 22vw, 260px); }
    .hero__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; margin-top: 8px; }

    .about { background: #f6f4ee; }
    .about__grid {
      display: grid;
      grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
      gap: clamp(32px, 6vw, 96px);
      align-items: center;
    }
    .about__grid .eyebrow { margin-bottom: 18px; }
    .about__tag { margin-top: 20px; font-size: clamp(18px, 1.8vw, 22px); }
    .about__text { display: grid; gap: 18px; color: var(--ink-soft); text-align: justify; .btn { margin-top: 12px; } }

    .head { display: grid; gap: 14px; margin-bottom: clamp(32px, 5vw, 56px); }
    .head--row { grid-template-columns: 1fr auto; align-items: end; }

    .ranges { margin: 0; padding: 0; list-style: none; border-top: 1px solid var(--ink); }
    .range {
      display: grid;
      grid-template-columns: 64px minmax(0, 1fr) auto;
      gap: 24px;
      align-items: center;
      padding: 26px 0;
      border-bottom: 1px solid var(--line);
      transition: padding 0.35s var(--ease), background 0.35s var(--ease);
      &:hover { padding-inline: 16px; background: var(--paper-raised); .range__name { color: var(--accent); } }
    }
    .range__num { color: var(--accent); font-size: 13px; font-weight: 700; letter-spacing: 0.1em; }
    .range__body { display: grid; gap: 6px; }
    .range__name { font-size: clamp(20px, 2.4vw, 30px); font-weight: 700; letter-spacing: -0.02em; transition: color 0.25s; }
    .range__intro { color: var(--body); font-size: 15px; }
    .range__count { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; white-space: nowrap; }

    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(32px, 4vw, 48px) clamp(20px, 3vw, 40px); }

    @media (max-width: 960px) {
      .about__grid { grid-template-columns: 1fr; }
      .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 600px) {
      .grid { grid-template-columns: 1fr; }
      .head--row { grid-template-columns: 1fr; }
      .range { grid-template-columns: 40px minmax(0, 1fr); }
      .range__count { grid-column: 2; }
      .about__text { text-align: left; }
    }
  `,
})
export class Home {
  protected readonly catalogue = inject(CatalogueService);
  protected readonly site = SITE;
  protected readonly marquee = ['UK manufactured', `${SITE.countries} countries`, 'LPCB · UL · BSI approved', `Since ${SITE.founded}`];
}
