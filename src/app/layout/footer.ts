import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogueService } from '../data/catalogue.service';
import { SITE } from '../site.config';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <div class="container">
        <div class="brand">
          <a routerLink="/" aria-label="Context Plus — home">
            <img src="brand/contextplus-logo.png" alt="Context Plus" width="300" height="178" />
          </a>
          <p>Fire detection, alarm and suppression systems manufactured in Great Britain and Ireland since {{ site.founded }}.</p>
        </div>

        <div class="cols">
          <div>
            <p class="eyebrow">Products</p>
            <ul>
              @for (cat of catalogue.navCategories; track cat.slug) {
                <li><a [routerLink]="['/catalogue', cat.slug]">{{ cat.name }}</a></li>
              }
            </ul>
          </div>
          <div>
            <p class="eyebrow">Company</p>
            <ul>
              <li><a routerLink="/about">Our company</a></li>
              <li><a routerLink="/downloads">Downloads</a></li>
              <li><a routerLink="/contact">Contact</a></li>
            </ul>
          </div>
          <div>
            <p class="eyebrow">Location</p>
            <address>
              {{ site.legalName }}<br />
              @for (line of site.address; track line) {
                {{ line }}<br />
              }
            </address>
          </div>
          <div>
            <p class="eyebrow">Contact</p>
            <p><a [href]="'mailto:' + site.email">{{ site.email }}</a></p>
            <p><a [href]="'tel:' + site.phoneHref">{{ site.phone }}</a></p>
            <p class="hours">{{ site.hours }}</p>
          </div>
        </div>

        <div class="bottom">
          <p>© {{ year }} {{ site.legalName }}. All rights reserved.</p>
          @if (site.social.length) {
            <ul class="social">
              @for (s of site.social; track s.href) {
                <li><a [href]="s.href" target="_blank" rel="noopener" [attr.aria-label]="s.label"><app-icon [name]="s.icon" [size]="20" /></a></li>
              }
            </ul>
          }
        </div>
      </div>
    </footer>
  `,
  styles: `
    .footer {
      padding-block: clamp(56px, 7vw, 88px) 32px;
      border-top: 1px solid var(--line);
    }
    .brand {
      display: grid;
      justify-items: center;
      gap: 16px;
      max-width: 420px;
      margin: 0 auto clamp(40px, 6vw, 64px);
      text-align: center;
      color: var(--ink-soft);
      img { height: 84px; width: auto; }
    }
    .cols {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 32px;
      padding-bottom: 40px;
      font-size: 15px;
      ul { margin: 14px 0 0; padding: 0; list-style: none; display: grid; gap: 8px; }
      a:hover { color: var(--accent); }
      address { margin-top: 14px; font-style: normal; line-height: 1.7; }
      .eyebrow + p { margin-top: 14px; }
      p { font-weight: 600; }
    }
    .hours { color: var(--muted); font-weight: 400 !important; }
    .bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding-top: 24px;
      border-top: 1px solid var(--line);
      color: var(--muted);
      font-size: 14px;
    }
    .social { display: flex; gap: 18px; margin: 0; padding: 0; list-style: none; a { color: var(--muted); } a:hover { color: var(--ink); } }
    @media (max-width: 900px) { .cols { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 520px) {
      .cols { grid-template-columns: 1fr; }
      .bottom { flex-direction: column; text-align: center; }
    }
  `,
})
export class Footer {
  protected readonly catalogue = inject(CatalogueService);
  protected readonly site = SITE;
  protected readonly year = new Date().getFullYear();
}
