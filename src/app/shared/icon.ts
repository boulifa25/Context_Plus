import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const PATHS = {
  chevron: 'M9 6l6 6-6 6',
  caret: 'M7 10l5 5 5-5z',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm10 17-5.2-5.2',
  close: 'M6 6l12 12M18 6 6 18',
  menu: 'M4 7h16M4 12h16M4 17h16',
  download: 'M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14',
  file: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zm0 0v5h5',
  check: 'M5 12.5l4.5 4.5L19 7',
  linkedin:
    'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.1c0-1.22-.02-2.78-1.7-2.78-1.7 0-1.96 1.33-1.96 2.7V21h-4z',
  facebook:
    'M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.87.25-1.46 1.5-1.46h1.55V4.47A20.6 20.6 0 0 0 14.3 4.3c-2.2 0-3.7 1.34-3.7 3.8v2.4H8v3h2.6V21z',
} as const;

export type IconName = keyof typeof PATHS;
const FILLED: IconName[] = ['caret', 'linkedin', 'facebook'];

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', style: 'display:inline-flex' },
  template: `
    <svg viewBox="0 0 24 24" [attr.width]="size()" [attr.height]="size()"
         [attr.fill]="filled() ? 'currentColor' : 'none'"
         [attr.stroke]="filled() ? 'none' : 'currentColor'"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path [attr.d]="path()" />
    </svg>
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(16);
  protected readonly path = computed(() => PATHS[this.name()]);
  protected readonly filled = computed(() => FILLED.includes(this.name()));
}
