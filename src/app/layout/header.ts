import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { CatalogueService } from '../data/catalogue.service';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.html',
  styleUrl: './header.scss',
  host: { '(document:keydown.escape)': 'closeAll()' },
})
export class Header {
  protected readonly catalogue = inject(CatalogueService);
  private readonly router = inject(Router);

  /** Menu déroulant ouvert (slug de catégorie, 'download') ou null. */
  protected readonly openMenu = signal<string | null>(null);
  protected readonly mobileOpen = signal(false);
  protected readonly mobileSection = signal<string | null>(null);

  constructor() {
    const sub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.closeAll());
    inject(DestroyRef).onDestroy(() => sub.unsubscribe());
  }

  protected toggle(id: string): void {
    this.openMenu.update((cur) => (cur === id ? null : id));
  }

  protected toggleMobileSection(id: string): void {
    this.mobileSection.update((cur) => (cur === id ? null : id));
  }

  protected closeAll(): void {
    this.openMenu.set(null);
    this.mobileOpen.set(false);
  }

  protected search(event: Event, input: HTMLInputElement): void {
    event.preventDefault();
    const q = input.value.trim();
    this.router.navigate(['/products'], { queryParams: q ? { q } : {} });
    input.blur();
  }
}
