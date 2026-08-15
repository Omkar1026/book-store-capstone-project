import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface Breadcrumb {
  label: string;
  path?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="flex items-center gap-1 text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
      @for (crumb of crumbs(); track crumb.label; let last = $last) {
        @if (crumb.path && !last) {
          <a [routerLink]="crumb.path" class="hover:text-indigo-600 transition-colors">{{ crumb.label }}</a>
          <span class="text-gray-300">/</span>
        } @else {
          <span [class.text-gray-800]="last" [class.font-medium]="last">{{ crumb.label }}</span>
        }
      }
    </nav>
  `
})
export class BreadcrumbComponent {
  readonly crumbs = input<Breadcrumb[]>([]);
}
