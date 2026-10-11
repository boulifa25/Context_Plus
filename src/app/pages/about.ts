import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogueService } from '../data/catalogue.service';
import { SITE } from '../site.config';
import { ContactBand } from '../shared/contact-band';
import { Icon } from '../shared/icon';
import { KeyFigures } from '../shared/key-figures';
import { Marquee } from '../shared/marquee';
import { Reveal } from '../shared/reveal.directive';

// Textes repris de la page « About » de contextplus.co.uk
const VALUES = [
  { title: 'Safety', text: 'Every product meets the fire safety standards required across the globe.' },
  { title: 'Competitive prices', text: 'Manufacturing in volume keeps costs down for our customers.' },
  { title: 'Delivery', text: 'A logistics operation built around on-time delivery, worldwide.' },
  { title: 'Training', text: 'Full manuals and technical training provided for our partners.' },
  { title: 'Certified products', text: 'Independently tested and certified, ready for export.' },
];
const COUNTRIES =
  'Afghanistan, Algeria, Angola, Armenia, Australia, Azerbaijan, Bahrain, Bangladesh, Barbados, Benin, Brunei Darussalam, Brazil, Bulgaria, Burkina Faso, Burundi, Cambodia, Cameroon, Central African Republic, Côte d’Ivoire, Cyprus, Democratic Republic of Congo, Djibouti, Egypt, Estonia, Ethiopia, Gambia, Georgia, Gibraltar, Ghana, Greece, Hong Kong, Iceland, India, Indonesia, Iraq, Ireland, Jamaica, Jordan, Kazakhstan, Kenya, Kosovo, Kuwait, Latvia, Lebanon, Libya, Lithuania, Malawi, Malaysia, Maldives, Malta, Mauritania, Mauritius, Mongolia, Morocco, Myanmar, Nepal, Nigeria, Oman, Pakistan, Philippines, Portugal, Qatar, Rwanda, Saudi Arabia, Senegal, Seychelles, Sierra Leone, Singapore, South Africa, Sri Lanka, Sudan, Taiwan, Tanzania, Thailand, Tunisia, Turkey, Uganda, United Arab Emirates, Vietnam, Yemen, Zambia, Zimbabwe'.split(
    ', ',
  );

@Component({
  selector: 'app-about',
  imports: [RouterLink, Icon, Marquee, KeyFigures, ContactBand, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero container">
      <p class="eyebrow">Four decades of expertise</p>
      <h1 class="display">Leading the way in <em class="accent">fire alarms</em></h1>
      <p class="lead">
        Established in Manchester in {{ site.founded }} with sales in over {{ site.countries }} countries, Context Plus is
        recognised as the largest exporter of conventional fire detection systems from the UK.
      </p>
    </section>

    <app-marquee [items]="marquee" />

    <section class="section container split">
      <div appReveal>
        <p class="eyebrow">Our company</p>
        <h2 class="h2">Manufactured in <em class="accent">Great Britain</em> &amp; Ireland</h2>
      </div>
      <div class="prose" appReveal="p, ul">
        <p>
          Context Plus Limited is a fully owned subsidiary of IMCI (Services) Limited, trading as Xport Sales — identified
          in 2017 by the London Stock Exchange as one of the 1000 Companies to Inspire Britain.
        </p>
        <p>Our fire products are wholly manufactured in Great Britain and Ireland and comprise:</p>
        <ul>
          <li>Wired and wireless conventional and analogue addressable fire alarm systems for commercial and industrial use.</li>
          <li>Battery and mains operated, wired and wireless fire alarms for domestic use.</li>
          <li>A wide range of fire resistant and fire performance cable.</li>
          <li>Gas extinguishing fire panels, clean agent cylinders and accessories.</li>
        </ul>
        <p>
          All products are independently approved by internationally recognised bodies such as UL, LPCB, BSI and Intertek,
          and are designed and tested to work seamlessly together within a unified fire alarm system.
        </p>
      </div>
    </section>

    <app-key-figures />

    <section class="section container">
      <div class="head" appReveal>
        <p class="eyebrow">Values</p>
        <h2 class="h2">What we <em class="accent">stand for</em></h2>
      </div>
      <ol class="values" appReveal="li">
        @for (v of values; track v.title; let i = $index) {
          <li>
            <span class="values__num">{{ (i + 1).toString().padStart(2, '0') }}</span>
            <h3>{{ v.title }}</h3>
            <p>{{ v.text }}</p>
          </li>
        }
      </ol>
    </section>

    <section class="section mission">
      <div class="container split">
        <div appReveal>
          <p class="eyebrow">Mission</p>
          <h2 class="h2">Quality products, <em class="accent">first-class</em> service.</h2>
        </div>
        <div class="prose" appReveal="p">
          <p>
            Offer our customers quality products and a first-class service. Delight them with prompt delivery and a fast
            response to their queries, enquiries and orders.
          </p>
          <p>
            Be courteous, honest, professional and efficient in our dealings — and keep improving the conditions of our
            employees while supporting their continuous professional development.
          </p>
          <a routerLink="/products" class="btn btn--primary">Explore the catalogue <app-icon name="chevron" /></a>
        </div>
      </div>
    </section>

    <section class="section container">
      <div class="head" appReveal>
        <p class="eyebrow">Worldwide distributors</p>
        <h2 class="h2">Active in {{ countries.length }} territories</h2>
        <p class="lead">We have active distributors and sales agents in the following overseas territories.</p>
      </div>
      <ul class="countries">
        @for (c of countries; track c) {
          <li>{{ c }}</li>
        }
      </ul>
    </section>

    <app-contact-band />
  `,
  styles: `
    .hero { display: grid; justify-items: center; gap: 24px; padding-block: clamp(64px, 10vw, 140px); text-align: center; .display { max-width: 1000px; } .lead { max-width: 700px; } }
    .split { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr); gap: clamp(32px, 6vw, 96px); align-items: start; .eyebrow { margin-bottom: 16px; } }
    .prose { display: grid; gap: 18px; color: var(--ink-soft); font-size: 17px; line-height: 1.75; ul { margin: 0; padding-left: 20px; display: grid; gap: 8px; } li::marker { color: var(--accent); } .btn { justify-self: start; margin-top: 8px; } }
    .head { display: grid; gap: 14px; margin-bottom: clamp(32px, 5vw, 56px); max-width: 760px; }
    .values { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 0; margin: 0; padding: 0; list-style: none; border-top: 1px solid var(--line); }
    .values li { display: grid; align-content: start; gap: 10px; padding: 28px 24px 28px 0; border-right: 1px solid var(--line); &:not(:first-child) { padding-left: 24px; } &:last-child { border-right: 0; } }
    .values__num { color: var(--accent); font-size: 13px; font-weight: 700; letter-spacing: 0.1em; }
    .values h3 { font-size: 20px; font-weight: 700; }
    .values p { color: var(--body); font-size: 15px; }
    .mission { background: #f6f4ee; }
    .countries { columns: 4 200px; column-gap: 32px; margin: 0; padding: 0; list-style: none; li { padding: 8px 0; border-bottom: 1px solid var(--line); break-inside: avoid; font-size: 15px; } }
    @media (max-width: 960px) {
      .split { grid-template-columns: 1fr; }
      .values { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .values li { padding: 24px 16px !important; border-bottom: 1px solid var(--line); }
    }
    @media (max-width: 520px) { .values { grid-template-columns: 1fr; } .values li { border-right: 0; } }
  `,
})
export class About {
  protected readonly catalogue = inject(CatalogueService);
  protected readonly site = SITE;
  protected readonly values = VALUES;
  protected readonly countries = COUNTRIES;
  protected readonly marquee = ['UK manufactured', `Since ${SITE.founded}`, `${SITE.countries} countries`, 'Full manuals & training'];
}
