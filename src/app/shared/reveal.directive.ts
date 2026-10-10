import { Directive, ElementRef, afterNextRender, inject, input, OnDestroy } from '@angular/core';

/**
 * Apparition en fondu + glissement au défilement (GSAP ScrollTrigger), comme sur la référence.
 * Navigateur uniquement, et désactivé si l'utilisateur préfère réduire les animations.
 *   <div appReveal>…</div>            l'élément entier
 *   <ul appReveal="li">…</ul>         ses enfants, en cascade
 */
@Directive({ selector: '[appReveal]' })
export class Reveal implements OnDestroy {
  readonly appReveal = input<string>('');
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private cleanup?: () => void;

  constructor() {
    afterNextRender(async () => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
      gsap.registerPlugin(ScrollTrigger);
      const host = this.el.nativeElement;
      const selector = this.appReveal();
      const targets = selector ? host.querySelectorAll(selector) : host;
      const tween = gsap.from(targets, {
        y: 28,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: selector ? 0.08 : 0,
        scrollTrigger: { trigger: host, start: 'top 88%', once: true },
      });
      this.cleanup = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });
  }

  ngOnDestroy(): void {
    this.cleanup?.();
  }
}
