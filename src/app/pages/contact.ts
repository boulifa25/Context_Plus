import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SITE } from '../site.config';
import { Icon } from '../shared/icon';

const COMPANY_TYPES = ['Distributor', 'Installer', 'Consultant / Specifier', 'End user', 'Other'];

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="container page">
      <div class="intro">
        <p class="eyebrow">Contact us</p>
        <h1 class="h1">Interested in working together?</h1>
        <p class="lead">Send us your enquiry and one of our dedicated sales managers will get back to you soon.</p>
      </div>

      <div class="layout">
        @if (sent()) {
          <div class="success" role="status">
            <app-icon name="check" [size]="28" />
            <h2 class="h3">Thank you — your enquiry is on its way.</h2>
            <p class="muted">We usually reply within one working day. For urgent requests call {{ site.phone }}.</p>
          </div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <div class="field"><label for="firstName">First name *</label><input id="firstName" formControlName="firstName" autocomplete="given-name" /></div>
            <div class="field"><label for="lastName">Last name *</label><input id="lastName" formControlName="lastName" autocomplete="family-name" /></div>
            <div class="field"><label for="company">Company name</label><input id="company" formControlName="company" autocomplete="organization" /></div>
            <div class="field">
              <label for="companyType">Company type</label>
              <select id="companyType" formControlName="companyType">
                <option value="">Select…</option>
                @for (t of companyTypes; track t) { <option [value]="t">{{ t }}</option> }
              </select>
            </div>
            <div class="field"><label for="country">Country *</label><input id="country" formControlName="country" autocomplete="country-name" /></div>
            <div class="field"><label for="phone">Phone</label><input id="phone" type="tel" formControlName="phone" autocomplete="tel" /></div>
            <div class="field field--full"><label for="email">Email *</label><input id="email" type="email" formControlName="email" autocomplete="email" /></div>
            <div class="field field--full"><label for="message">Message *</label><textarea id="message" rows="5" formControlName="message"></textarea></div>
            @if (error()) {
              <p class="error field--full" role="alert">{{ error() }}</p>
            }
            <div class="field--full">
              <button type="submit" class="btn btn--primary btn--sm" [disabled]="sending()">
                {{ sending() ? 'Sending…' : 'Submit' }} <app-icon name="chevron" [size]="13" />
              </button>
            </div>
          </form>
        }

        <aside class="details">
          <h2>{{ site.legalName }}</h2>
          <dl>
            <div><dt>Location</dt><dd>@for (l of site.address; track l) { {{ l }}<br /> }</dd></div>
            <div><dt>Email</dt><dd><a [href]="'mailto:' + site.email">{{ site.email }}</a></dd></div>
            <div><dt>Phone</dt><dd><a [href]="'tel:' + site.phoneHref">{{ site.phone }}</a></dd></div>
            <div><dt>Opening hours</dt><dd>{{ site.hours }}</dd></div>
          </dl>
        </aside>
      </div>
    </section>
  `,
  styles: `
    .page { padding-block: clamp(48px, 7vw, 96px) var(--section-y); }
    .intro { display: grid; gap: 18px; max-width: 720px; margin-bottom: clamp(32px, 5vw, 56px); }
    .layout { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); gap: clamp(32px, 6vw, 96px); align-items: start; }
    form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px 16px; }
    .field { display: grid; gap: 6px; }
    .field--full { grid-column: 1 / -1; }
    label { font-size: 14px; font-weight: 700; }
    input, select, textarea {
      width: 100%; padding: 10px 0;
      border: 0; border-bottom: 1px solid var(--ink-soft); border-radius: 0;
      background: transparent; font-size: 16px; outline: none;
      &:focus { border-color: var(--accent); box-shadow: 0 1px 0 var(--accent); }
      &.ng-invalid.ng-touched { border-color: #c0262d; }
    }
    textarea { resize: vertical; }
    .error { color: #c0262d; font-weight: 600; }
    .details {
      h2 { margin-bottom: 20px; font-size: 26px; font-weight: 500; }
      dl { margin: 0; }
      dl > div { padding: 14px 0; border-bottom: 1px solid var(--line); }
      dt { font-size: 14px; font-weight: 700; }
      dd { margin: 4px 0 0; color: var(--body); font-weight: 600; line-height: 1.5; }
      a:hover { color: var(--accent); }
    }
    .success { display: grid; gap: 14px; justify-items: start; padding: 40px; border: 1px solid var(--line); background: var(--paper-raised); app-icon { color: var(--accent); } }
    @media (max-width: 860px) { .layout { grid-template-columns: 1fr; } }
    @media (max-width: 520px) { form { grid-template-columns: 1fr; } }
  `,
})
export class Contact implements OnInit {
  /** ?product=… pré-remplit le message depuis une fiche produit */
  readonly product = input<string>();
  protected readonly site = SITE;
  protected readonly companyTypes = COMPANY_TYPES;
  protected readonly sent = signal(false);
  protected readonly sending = signal(false);
  protected readonly error = signal('');

  protected readonly form = inject(FormBuilder).nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    company: [''],
    companyType: [''],
    country: ['', Validators.required],
    phone: [''],
    email: ['', [Validators.required, Validators.email]],
    message: ['', Validators.required],
  });

  ngOnInit(): void {
    const p = this.product();
    if (p) this.form.controls.message.setValue(`Hello, I would like a quote for: ${p}\n\nQuantity: `);
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Please fill in the required fields (*).');
      return;
    }
    this.error.set('');
    const v = this.form.getRawValue();

    // Sans point d'envoi configuré, on ouvre le client mail avec le message pré-rempli.
    if (!SITE.contactEndpoint) {
      const body = [
        `Name: ${v.firstName} ${v.lastName}`,
        `Company: ${v.company} (${v.companyType})`,
        `Country: ${v.country}`,
        `Phone: ${v.phone}`,
        `Email: ${v.email}`,
        '',
        v.message,
      ].join('\n');
      location.href = `mailto:${SITE.email}?subject=${encodeURIComponent('Website enquiry')}&body=${encodeURIComponent(body)}`;
      this.sent.set(true);
      return;
    }

    this.sending.set(true);
    try {
      const res = await fetch(SITE.contactEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(v),
      });
      if (!res.ok) throw new Error(String(res.status));
      this.sent.set(true);
    } catch {
      this.error.set(`Sorry, the message could not be sent. Please email ${SITE.email}.`);
    } finally {
      this.sending.set(false);
    }
  }
}
