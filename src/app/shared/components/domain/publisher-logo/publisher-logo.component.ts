import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface PublisherTile {
  id: string;
  name: string;
  logoUrl?: string;
  country?: string;
}

@Component({
  selector: 'app-publisher-logo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <a
      [routerLink]="['/catalogue/publisher', publisher().id]"
      class="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-400 hover:shadow-sm transition-all text-center">
      @if (publisher().logoUrl) {
        <img
          [src]="publisher().logoUrl"
          [alt]="publisher().name"
          class="h-10 object-contain"
        />
      } @else {
        <div class="h-10 w-16 bg-gray-100 rounded flex items-center justify-center text-lg">🏢</div>
      }
      <span class="text-xs font-medium text-gray-700">{{ publisher().name }}</span>
    </a>
  `
})
export class PublisherLogoComponent {
  readonly publisher = input.required<PublisherTile>();
  readonly click = output<string>();
}
