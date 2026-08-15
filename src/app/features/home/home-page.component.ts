import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { AuthStore } from '../../core/store/auth.store';
import { RecommendationStore } from '../../core/store/recommendation.store';
import { CartStore } from '../../core/store/cart.store';

import { BookService } from '../../core/services/book.service';
import { CategoryService } from '../../core/services/category.service';
import { PublisherService } from '../../core/services/publisher.service';

import { Book, BookCategory, Publisher } from '../../core/models/book.model';
import { CartItem } from '../../core/models/cart.model';

import { BookGridComponent } from '../../shared/components/domain/book-grid/book-grid.component';
import { RecommendedBooksComponent } from '../../shared/components/domain/recommended-books/recommended-books.component';
import { CategoryChipComponent } from '../../shared/components/domain/category-chip/category-chip.component';
import { PublisherLogoComponent, PublisherTile } from '../../shared/components/domain/publisher-logo/publisher-logo.component';
import { SpinnerComponent } from '../../shared/components/ui/spinner/spinner.component';
import { EmptyStateComponent } from '../../shared/components/ui/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/ui/error-state/error-state.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BookGridComponent,
    RecommendedBooksComponent,
    CategoryChipComponent,
    PublisherLogoComponent,
    SpinnerComponent,
    EmptyStateComponent,
    ErrorStateComponent,
  ],
  template: `
    <!-- ── Hero Banner ────────────────────────────────────────────────────── -->
    <section class="bg-indigo-700 text-white">
      <div class="max-w-5xl mx-auto px-4 py-16 flex flex-col items-center text-center gap-6">
        <h1 class="text-4xl font-bold tracking-tight">Your Next Great Read Awaits</h1>
        <p class="text-indigo-200 text-lg max-w-xl">
          Discover thousands of books across every genre — from bestsellers to hidden gems.
        </p>
        <a
          routerLink="/catalogue"
          class="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-6 py-3 rounded-full hover:bg-indigo-50 transition-colors text-base">
          Browse Catalogue →
        </a>
      </div>
    </section>

    <div class="max-w-6xl mx-auto px-4 py-10 space-y-14">

      <!-- ── Category Chips ──────────────────────────────────────────────── -->
      <section>
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Shop by Category</h2>

        @if (categoriesLoading()) {
          <app-spinner [center]="false" size="sm" />
        } @else if (categoriesError()) {
          <app-error-state
            title="Couldn't load categories"
            [message]="categoriesError()!"
            retryLabel="Retry"
            (retry)="loadCategories()"
          />
        } @else if (categories().length === 0) {
          <app-empty-state icon="🗂️" title="No categories found" message="" />
        } @else {
          <div class="flex flex-wrap gap-2">
            @for (cat of categories(); track cat.id) {
              <a [routerLink]="['/catalogue', cat.slug]">
                <app-category-chip
                  [label]="cat.name"
                  [categoryId]="cat.id"
                />
              </a>
            }
          </div>
        }
      </section>

      <!-- ── Trending Books ──────────────────────────────────────────────── -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Trending Now</h2>
          <a routerLink="/catalogue" class="text-sm text-indigo-600 hover:underline font-medium">View all →</a>
        </div>

        @if (trendingLoading()) {
          <app-spinner [center]="true" size="md" />
        } @else if (trendingError()) {
          <app-error-state
            title="Couldn't load trending books"
            [message]="trendingError()!"
            retryLabel="Retry"
            (retry)="loadTrending()"
          />
        } @else {
          <app-book-grid
            [books]="trendingBooks()"
            (addToCart)="onAddToCart($event)"
          />
        }
      </section>

      <!-- ── Recommended Books ───────────────────────────────────────────── -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900">
            {{ authStore.isAuthenticated() ? 'Recommended for You' : 'Staff Picks' }}
          </h2>
        </div>

        @if (recommendationStore.isLoading()) {
          <app-spinner [center]="true" size="md" />
        } @else if (recommendationStore.error()) {
          <app-error-state
            title="Couldn't load recommendations"
            [message]="recommendationStore.error()!"
            retryLabel="Retry"
            (retry)="loadRecommendedBooks()"
          />
        } @else {
          <app-recommended-books
            [books]="recommendedBooks()"
            (addToCart)="onAddToCart($event)"
          />
        }
      </section>

      <!-- ── Publisher Strip ─────────────────────────────────────────────── -->
      <section>
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Our Publishers</h2>

        @if (publishersLoading()) {
          <app-spinner [center]="false" size="sm" />
        } @else if (publishersError()) {
          <app-error-state
            title="Couldn't load publishers"
            [message]="publishersError()!"
            retryLabel="Retry"
            (retry)="loadPublishers()"
          />
        } @else if (publishers().length === 0) {
          <app-empty-state icon="🏢" title="No publishers found" message="" />
        } @else {
          <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            @for (pub of publisherTiles(); track pub.id) {
              <app-publisher-logo [publisher]="pub" />
            }
          </div>
        }
      </section>

    </div>
  `
})
export class HomePageComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  readonly recommendationStore = inject(RecommendationStore);
  private readonly cartStore = inject(CartStore);
  private readonly bookService = inject(BookService);
  private readonly categoryService = inject(CategoryService);
  private readonly publisherService = inject(PublisherService);
  private readonly title = inject(Title);

  // ── Trending books local state ──────────────────────────────────────────
  readonly trendingBooks = signal<Book[]>([]);
  readonly trendingLoading = signal(false);
  readonly trendingError = signal<string | null>(null);

  // ── Categories local state ──────────────────────────────────────────────
  readonly categories = signal<BookCategory[]>([]);
  readonly categoriesLoading = signal(false);
  readonly categoriesError = signal<string | null>(null);

  // ── Publishers local state ──────────────────────────────────────────────
  readonly publishers = signal<Publisher[]>([]);
  readonly publishersLoading = signal(false);
  readonly publishersError = signal<string | null>(null);

  // ── Derived: recommended books (map Recommendation → BookSummary) ───────
  // Recommendations store only holds bookId references; we surface the
  // matching books from trendingBooks (already loaded) or fall back to
  // trendingBooks for guests.
  readonly recommendedBooks = computed(() => {
    if (!this.authStore.isAuthenticated()) {
      // Unauthenticated: surface trending as "staff picks"
      return this.trendingBooks();
    }
    const recs = this.recommendationStore.recommended();
    if (recs.length === 0) {
      // Authenticated but no personal recs yet — fall back to trending
      return this.trendingBooks();
    }
    // Map recommendation bookIds to the trending book objects we have
    const bookMap = new Map(this.trendingBooks().map(b => [b.id, b]));
    return recs
      .map(r => bookMap.get(r.bookId))
      .filter((b): b is Book => b !== undefined);
  });

  // ── Publisher tiles (adapt Publisher → PublisherTile) ───────────────────
  readonly publisherTiles = computed<PublisherTile[]>(() =>
    this.publishers().map(p => ({ id: p.id, name: p.name }))
  );

  ngOnInit(): void {
    this.title.setTitle('BookStore — Your Next Great Read Awaits');
    this.loadTrending();
    this.loadCategories();
    this.loadPublishers();
    this.loadRecommendedBooks();
  }

  loadTrending(): void {
    this.trendingLoading.set(true);
    this.trendingError.set(null);
    this.bookService.getBooks({ _sort: 'rating', _order: 'desc', _limit: 8 }).subscribe({
      next: books => {
        this.trendingBooks.set(books);
        this.trendingLoading.set(false);
      },
      error: err => {
        this.trendingError.set(err?.error?.message ?? 'Failed to load trending books');
        this.trendingLoading.set(false);
      }
    });
  }

  loadCategories(): void {
    this.categoriesLoading.set(true);
    this.categoriesError.set(null);
    this.categoryService.getCategories().subscribe({
      next: cats => {
        this.categories.set(cats);
        this.categoriesLoading.set(false);
      },
      error: err => {
        this.categoriesError.set(err?.error?.message ?? 'Failed to load categories');
        this.categoriesLoading.set(false);
      }
    });
  }

  loadPublishers(): void {
    this.publishersLoading.set(true);
    this.publishersError.set(null);
    this.publisherService.getPublishers().subscribe({
      next: pubs => {
        this.publishers.set(pubs);
        this.publishersLoading.set(false);
      },
      error: err => {
        this.publishersError.set(err?.error?.message ?? 'Failed to load publishers');
        this.publishersLoading.set(false);
      }
    });
  }

  loadRecommendedBooks(): void {
    const user = this.authStore.currentUser();
    if (user) {
      this.recommendationStore.loadRecommendations(user.id);
    }
    // For guests, recommendedBooks() computed falls back to trendingBooks
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
}
