import { Directive, ElementRef, OnDestroy, afterNextRender, inject, input } from '@angular/core';

/**
 * Apparition en fondu + glissement au défilement (IntersectionObserver + transition CSS, sans librairie).
 *   <div appReveal>…</div>            l'élément entier
 *   <ul appReveal="li">…</ul>         ses enfants, en cascade
 * Le contenu reste visible côté serveur et sans JavaScript ; seuls les éléments encore sous la
 * ligne de flottaison sont masqués puis révélés. Respecte « réduire les animations ».
 */
@Directive({ selector: '[appReveal]' })
export class Reveal implements OnDestroy {
  readonly appReveal = input<string>('');
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?: IntersectionObserver;

  constructor() {
    afterNextRender(() => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const host = this.el.nativeElement;
      // Déjà visible au chargement : on n'anime pas (pas de clignotement du contenu pré-rendu)
      if (host.getBoundingClientRect().top < innerHeight * 0.9) return;
      const selector = this.appReveal();
      const targets = selector ? Array.from(host.querySelectorAll<HTMLElement>(selector)) : [host];
      targets.forEach((t, i) => {
        t.classList.add('reveal');
        t.style.setProperty('--reveal-delay', `${Math.min(i, 8) * 70}ms`);
      });
      this.observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          targets.forEach((t) => t.classList.add('reveal--in'));
          this.observer?.disconnect();
        },
        { rootMargin: '0px 0px -12% 0px' },
      );
      this.observer.observe(host);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
