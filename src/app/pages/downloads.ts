import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogueService } from '../data/catalogue.service';
import { ContactBand } from '../shared/contact-band';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-downloads',
  imports: [RouterLink, Icon, ContactBand],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="intro container">
      <p class="eyebrow">Downloads</p>
      <h1 class="display">Documents</h1>
      <p class="lead">
        Installation manuals and product brochures. Datasheets and approval certificates are available on each
        <a routerLink="/products">product page</a>.
      </p>
    </section>

    @for (group of catalogue.downloads; track group.id) {
      @if (group.documents.length) {
        <section class="group container">
          <div class="group__head">
            <h2 class="h3">{{ group.title }}</h2>
            <p class="muted">{{ group.intro }}</p>
          </div>
          <ul>
            @for (d of group.documents; track d.url) {
              <li>
                <a [href]="d.url" target="_blank" rel="noopener" class="doc">
                  <app-icon name="file" [size]="20" />
                  <span class="doc__title">{{ d.title }}</span>
                  <span class="doc__meta">PDF · {{ (d.size / 1e6).toFixed(1) }} MB</span>
                  <span class="doc__icon"><app-icon name="download" [size]="18" /></span>
                </a>
              </li>
            }
          </ul>
        </section>
      }
    }

    <app-contact-band variant="compact" />
  `,
  styles: `
    .intro { display: grid; gap: 20px; padding-block: clamp(48px, 7vw, 96px) clamp(24px, 4vw, 48px); .lead { max-width: 640px; } a { text-decoration: underline; text-underline-offset: 3px; } }
    .group { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2.2fr); gap: clamp(24px, 5vw, 80px); padding-block: 48px; border-top: 1px solid var(--line); }
    .group__head { display: grid; gap: 10px; align-content: start; }
    ul { margin: 0; padding: 0; list-style: none; border-top: 1px solid var(--ink); }
    .doc {
      display: grid; grid-template-columns: 20px minmax(0, 1fr) auto 44px; gap: 18px; align-items: center;
      padding: 16px 0; border-bottom: 1px solid var(--line); transition: padding 0.3s var(--ease);
      > app-icon { color: var(--accent); }
      &:hover { padding-inline: 10px; .doc__icon { background: var(--accent); border-color: var(--accent); color: var(--white); } }
    }
    .doc__title { font-weight: 600; overflow-wrap: anywhere; }
    .doc__meta { color: var(--muted); font-size: 14px; white-space: nowrap; }
    .doc__icon { display: grid; place-items: center; width: 44px; height: 44px; border: 1px solid var(--line-strong); border-radius: var(--radius); transition: all 0.2s; }
    app-contact-band { margin-top: var(--section-y); }
    @media (max-width: 860px) {
      .group { grid-template-columns: 1fr; }
      .doc { grid-template-columns: 20px minmax(0, 1fr) 44px; .doc__meta { display: none; } }
    }
  `,
})
export class Downloads {
  protected readonly catalogue = inject(CatalogueService);
}
