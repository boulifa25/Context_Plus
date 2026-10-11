import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CatalogueService } from '../data/catalogue.service';
import { SITE } from '../site.config';
import { Approvals } from './approvals';
import { Reveal } from './reveal.directive';

/** Section sombre : chiffres clés + organismes de certification. */
@Component({
  selector: 'app-key-figures',
  imports: [Approvals, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section section--dark">
      <div class="container">
        <div class="head" appReveal>
          <p class="eyebrow">Why Context Plus</p>
          <h2 class="h2">Four decades of <em class="accent">certified</em> fire safety</h2>
        </div>
        <dl class="figures" appReveal=".figure">
          <div class="figure"><dt>Established</dt><dd>{{ site.founded }}</dd></div>
          <div class="figure"><dt>Countries supplied</dt><dd>{{ site.countries }}</dd></div>
          <div class="figure"><dt>Products</dt><dd>{{ catalogue.productCount }}</dd></div>
          <div class="figure"><dt>Technical documents</dt><dd>{{ catalogue.documentCount }}</dd></div>
        </dl>
        <p class="eyebrow approvals-title">Independently approved by</p>
        <app-approvals />
      </div>
    </section>
  `,
  styles: `
    .head { display: grid; gap: 14px; max-width: 760px; margin-bottom: clamp(36px, 5vw, 64px); }
    .figures {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      margin: 0 0 clamp(48px, 6vw, 80px);
      border-top: 1px solid var(--line-strong);
    }
    .figure {
      display: flex;
      flex-direction: column-reverse;
      gap: 10px;
      padding: 28px 24px 0 0;
      &:not(:first-child) { padding-left: 24px; border-left: 1px solid var(--line); }
    }
    dd { margin: 0; font-size: clamp(44px, 6vw, 84px); font-weight: 800; line-height: 0.95; letter-spacing: -0.05em; }
    dt { color: var(--muted); font-size: 13px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; }
    .approvals-title { margin-bottom: 20px; }
    @media (max-width: 760px) {
      .figures { grid-template-columns: repeat(2, minmax(0, 1fr)); row-gap: 32px; }
      .figure:nth-child(3) { padding-left: 0; border-left: 0; }
    }
  `,
})
export class KeyFigures {
  protected readonly catalogue = inject(CatalogueService);
  protected readonly site = SITE;
}
