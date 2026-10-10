import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="container">
      <p class="eyebrow">Error 404</p>
      <h1 class="display">Page not found</h1>
      <p class="lead">The page you are looking for has moved or no longer exists. Try searching the catalogue instead.</p>
      <div class="actions">
        <a routerLink="/products" class="btn btn--primary">Browse products <app-icon name="chevron" /></a>
        <a routerLink="/" class="btn">Back to home <app-icon name="chevron" /></a>
      </div>
    </section>
  `,
  styles: `
    section { display: grid; justify-items: center; gap: 24px; padding-block: clamp(80px, 14vw, 180px); text-align: center; }
    .lead { max-width: 560px; }
    .actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; }
  `,
})
export class NotFound {}
