import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterState {
  categoryId: string | null;
  publisherId: string | null;
  minPrice: number | null;
  maxPrice: number | null;
}

export interface FilterCategory {
  id: string;
  name: string;
}

export interface FilterPublisher {
  id: string;
  name: string;
}

@Component({
  selector: 'app-sidebar-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <aside class="w-64 shrink-0 space-y-6">

      <!-- Category filter -->
      <div>
        <h3 class="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">Category</h3>
        <ul class="space-y-1">
          <li>
            <button
              (click)="setCategory(null)"
              [class.text-indigo-600]="!selectedCategoryId()"
              [class.font-medium]="!selectedCategoryId()"
              class="text-sm text-gray-600 hover:text-indigo-600 w-full text-left py-0.5">
              All Categories
            </button>
          </li>
          @for (cat of categories(); track cat.id) {
            <li>
              <button
                (click)="setCategory(cat.id)"
                [class.text-indigo-600]="selectedCategoryId() === cat.id"
                [class.font-medium]="selectedCategoryId() === cat.id"
                class="text-sm text-gray-600 hover:text-indigo-600 w-full text-left py-0.5">
                {{ cat.name }}
              </button>
            </li>
          }
        </ul>
      </div>

      <!-- Price range -->
      <div>
        <h3 class="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">Price Range</h3>
        <div class="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min"
            [(ngModel)]="minPrice"
            class="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
          <span class="text-gray-400">–</span>
          <input
            type="number"
            placeholder="Max"
            [(ngModel)]="maxPrice"
            class="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </div>
      </div>

      <!-- Publisher filter -->
      <div>
        <h3 class="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">Publisher</h3>
        <ul class="space-y-1">
          <li>
            <button
              (click)="setPublisher(null)"
              [class.text-indigo-600]="!selectedPublisherId()"
              [class.font-medium]="!selectedPublisherId()"
              class="text-sm text-gray-600 hover:text-indigo-600 w-full text-left py-0.5">
              All Publishers
            </button>
          </li>
          @for (pub of publishers(); track pub.id) {
            <li>
              <button
                (click)="setPublisher(pub.id)"
                [class.text-indigo-600]="selectedPublisherId() === pub.id"
                [class.font-medium]="selectedPublisherId() === pub.id"
                class="text-sm text-gray-600 hover:text-indigo-600 w-full text-left py-0.5">
                {{ pub.name }}
              </button>
            </li>
          }
        </ul>
      </div>

      <!-- Apply button -->
      <button
        (click)="applyFilters()"
        class="w-full bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-indigo-700 transition-colors">
        Apply Filters
      </button>

      <!-- Reset -->
      <button
        (click)="resetFilters()"
        class="w-full text-sm text-gray-500 hover:text-gray-700 underline">
        Reset
      </button>
    </aside>
  `
})
export class SidebarFilterComponent {
  readonly categories = input<FilterCategory[]>([]);
  readonly publishers = input<FilterPublisher[]>([]);
  readonly selectedCategoryId = input<string | null>(null);
  readonly selectedPublisherId = input<string | null>(null);

  readonly filterChange = output<FilterState>();

  minPrice: number | null = null;
  maxPrice: number | null = null;

  setCategory(id: string | null): void {
    this.emitChange({ categoryId: id });
  }

  setPublisher(id: string | null): void {
    this.emitChange({ publisherId: id });
  }

  applyFilters(): void {
    this.emitChange({
      categoryId: this.selectedCategoryId(),
      publisherId: this.selectedPublisherId(),
      minPrice: this.minPrice,
      maxPrice: this.maxPrice
    });
  }

  resetFilters(): void {
    this.minPrice = null;
    this.maxPrice = null;
    this.filterChange.emit({ categoryId: null, publisherId: null, minPrice: null, maxPrice: null });
  }

  private emitChange(partial: Partial<FilterState>): void {
    this.filterChange.emit({
      categoryId: this.selectedCategoryId(),
      publisherId: this.selectedPublisherId(),
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      ...partial
    });
  }
}
