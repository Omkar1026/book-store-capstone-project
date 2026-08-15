import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { CatalogueStore } from '../../../core/store/catalogue.store';
import { CartStore } from '../../../core/store/cart.store';
import { CategoryService } from '../../../core/services/category.service';
import { PublisherService } from '../../../core/services/publisher.service';

import { Book } from '../../../core/models/book.model';
import { SortOption } from '../../../core/models/catalogue.model';
import { CartItem } from '../../../core/models/cart.model';

import { BookGridComponent } from '../../../shared/components/domain/book-grid/book-grid.component';
import {
  SidebarFilterComponent,
  FilterState,
  FilterCategory,
  FilterPublisher
} from '../../../shared/components/layout/sidebar-filter/sidebar-filter.component';
import { SpinnerComponent } from '../../../shared/components/ui/spinner/spinner.component';
import { ErrorStateComponent } from '../../../shared/components/ui/error-state/error-state.component';

@Component({
  selector: 'app-publisher-page',
  standalone: true,
  imports: [
    CommonModule,
    BookGridComponent,
    SidebarFilterComponent,
    SpinnerComponent,
    ErrorStateComponent
  ],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">

      <!-- Page header -->
      <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <nav class="text-sm text-gray-500 mb-1">
            <a routerLink="/catalogue" class="hover:text-indigo-600">Catalogue</a>
            <span class="mx-1">›</span>
            <span class="text-gray-900 font-medium">{{ publisherName() || 'Publisher' }}</span>
          </nav>
          <h1 class="text-2xl font-bold text-gray-900">{{ publisherName() || 'Publisher Books' }}</h1>
        </div>

        <!-- Sort control -->
        <div class="flex items-center gap-3">
          <label class="text-sm text-gray-600 font-medium">Sort:</label>
          <select
            [value]="catalogueStore.sortOption()"
            (change)="onSortChange($event)"
            class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400">
            <option value="relevance">Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Highest Rated</option>
            <option value="newest">Newest</option>
            <option value="title_asc">Title A–Z</option>
          </select>
        </div>
      </div>

      <div class="flex gap-8">

        <!-- Sidebar -->
        <app-sidebar-filter
          [categories]="filterCategories()"
          [publishers]="filterPublishers()"
          [selectedCategoryId]="catalogueStore.filter().categoryId ?? null"
          [selectedPublisherId]="catalogueStore.filter().publisherId ?? null"
          (filterChange)="onFilterChange($event)"
        />

        <!-- Main content -->
        <div class="flex-1 min-w-0">

          @if (catalogueStore.isLoading()) {
            <app-spinner [center]="true" size="md" />
          } @else if (catalogueStore.error()) {
            <app-error-state
              title="Couldn't load books"
              [message]="catalogueStore.error()!"
              retryLabel="Retry"
              (retry)="catalogueStore.loadBooks()"
            />
          } @else {
            <app-book-grid
              [books]="catalogueStore.filteredBooks()"
              (addToCart)="onAddToCart($event)"
            />

            <!-- Pagination -->
            @if (totalPages() > 1) {
              <div class="flex justify-center items-center gap-2 mt-8">
                <button
                  (click)="onPageChange(catalogueStore.page() - 1)"
                  [disabled]="catalogueStore.page() <= 1"
                  class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  ← Prev
                </button>

                @for (p of pageNumbers(); track p) {
                  <button
                    (click)="onPageChange(p)"
                    [class.bg-indigo-600]="p === catalogueStore.page()"
                    [class.text-white]="p === catalogueStore.page()"
                    [class.border-indigo-600]="p === catalogueStore.page()"
                    class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    {{ p }}
                  </button>
                }

                <button
                  (click)="onPageChange(catalogueStore.page() + 1)"
                  [disabled]="catalogueStore.page() >= totalPages()"
                  class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  Next →
                </button>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `
})
export class PublisherPageComponent implements OnInit {
  readonly catalogueStore = inject(CatalogueStore);
  private readonly cartStore = inject(CartStore);
  private readonly categoryService = inject(CategoryService);
  private readonly publisherService = inject(PublisherService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly title = inject(Title);

  readonly filterCategories = signal<FilterCategory[]>([]);
  readonly filterPublishers = signal<FilterPublisher[]>([]);
  readonly publisherName = signal<string>('');

  totalPages(): number {
    return Math.ceil(this.catalogueStore.filteredBooks().length / this.catalogueStore.pageSize()) || 1;
  }

  pageNumbers(): number[] {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  ngOnInit(): void {
    const publisherId = this.route.snapshot.paramMap.get('id') ?? '';

    this.publisherService.getPublisherById(publisherId).subscribe({
      next: pub => {
        this.publisherName.set(pub.name);
        this.title.setTitle(`${pub.name} — BookStore`);
      },
      error: () => {}
    });

    this.catalogueStore.setFilter({ publisherId });
    this.catalogueStore.setSort('relevance');
    this.catalogueStore.setPage(1);
    this.catalogueStore.loadBooks();

    this.categoryService.getCategories().subscribe({
      next: cats => this.filterCategories.set(cats.map(c => ({ id: c.id, name: c.name }))),
      error: () => {}
    });

    this.publisherService.getPublishers().subscribe({
      next: pubs => this.filterPublishers.set(pubs.map(p => ({ id: p.id, name: p.name }))),
      error: () => {}
    });
  }

  onFilterChange(state: FilterState): void {
    const filter = {
      categoryId: state.categoryId ?? undefined,
      publisherId: state.publisherId ?? undefined,
      minPrice: state.minPrice ?? undefined,
      maxPrice: state.maxPrice ?? undefined
    };
    this.catalogueStore.setFilter(filter);
    this.catalogueStore.loadBooks();
    this.syncQueryParams();
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as SortOption;
    this.catalogueStore.setSort(value);
    this.catalogueStore.loadBooks();
    this.syncQueryParams();
  }

  onPageChange(page: number): void {
    this.catalogueStore.setPage(page);
    this.catalogueStore.loadBooks();
    this.syncQueryParams();
  }

  onAddToCart(book: Book): void {
    const item: CartItem = {
      bookId: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      quantity: 1,
      imageUrl: book.imageUrl,
      stock: book.stock
    };
    this.cartStore.addItem(item);
  }

  private syncQueryParams(): void {
    const f = this.catalogueStore.filter();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        categoryId: f.categoryId || null,
        minPrice: f.minPrice ?? null,
        maxPrice: f.maxPrice ?? null,
        sort: this.catalogueStore.sortOption() !== 'relevance' ? this.catalogueStore.sortOption() : null,
        page: this.catalogueStore.page() > 1 ? this.catalogueStore.page() : null
      },
      queryParamsHandling: 'merge'
    });
  }
}
