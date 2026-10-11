import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Approval {
  label: string;
  caption: string;
  /** Logo officiel (fourni par le client) dans public/brand/approvals/ ; sinon repère textuel. */
  logo?: string;
}

/**
 * Organismes de certification des produits Context Plus.
 * Pour afficher un logo officiel : déposer le fichier (SVG ou PNG transparent) dans
 * public/brand/approvals/ et renseigner « logo ». Ne pas redessiner les marques soi-même.
 */
const APPROVALS: Approval[] = [
  { label: 'LPCB', caption: 'Loss Prevention Certification Board', logo: 'brand/approvals/lpcb.png' },
  { label: 'UL', caption: 'UL Listed' },
  { label: 'FM', caption: 'FM Approved' },
  { label: 'VdS', caption: 'VdS Approved' },
  { label: 'BSI', caption: 'Kitemark' },
  { label: 'Intertek', caption: 'Approved' },
];

@Component({
  selector: 'app-approvals',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul aria-label="Product approvals">
      @for (a of approvals; track a.label) {
        <li [title]="a.caption">
          @if (a.logo) {
            <img [src]="a.logo" [alt]="a.label + ' – ' + a.caption" height="64" width="70" loading="lazy" />
          } @else {
            <span class="mark">
              <strong>{{ a.label }}</strong>
              <small>{{ a.caption }}</small>
            </span>
          }
        </li>
      }
    </ul>
  `,
  styles: `
    ul {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      margin: 0;
      padding: 0;
      list-style: none;
      border-block: 1px solid var(--line);
    }
    li {
      display: grid;
      place-items: center;
      min-height: 112px;
      padding: 16px;
      border-right: 1px solid var(--line);
      &:last-child { border-right: 0; }
    }
    img { height: 64px; width: auto; opacity: 0.85; }
    :host-context(.section--dark) img { filter: invert(1); }
    .mark { display: grid; justify-items: center; gap: 4px; text-align: center; color: var(--ink); opacity: 0.85; }
    strong { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; line-height: 1; }
    small { color: var(--muted); font-size: 10px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; }
    @media (max-width: 860px) {
      ul { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      li:nth-child(3) { border-right: 0; }
      li:nth-child(-n + 3) { border-bottom: 1px solid var(--line); }
    }
  `,
})
export class Approvals {
  protected readonly approvals = APPROVALS;
}
