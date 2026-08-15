import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Title } from '@angular/platform-browser';

import { CartStore } from '../../core/store/cart.store';
import { ToastStore } from '../../core/store/toast.store';

import { BookService } from '../../core/services/book.service';
import { DeliveryService } from '../../core/services/delivery.service';

import { Book, BookCategory, Publisher } from '../../core/models/book.model';
import { CartItem } from '../../core/models/cart.model';
import { Review } from '../../core/models/review.model';

import { BreadcrumbComponent, Breadcrumb } from '../../shared/components/layout/breadcrumb/breadcrumb.component';
import { DeliveryDateBadgeComponent } from '../../shared/components/domain/delivery-date-badge/delivery-date-badge.component';
import { RelatedBooksComponent } from '../../shared/components/domain/related-books/related-books.component';
import { StarRatingComponent } from '../../shared/components/ui/star-rating/star-rating.component';
import { SpinnerComponent } from '../../shared/components/ui/spinner/spinner.component';
import { ErrorStateComponent } from '../../shared/components/ui/error-state/error-state.component';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BreadcrumbComponent,
    DeliveryDateBadgeComponent,
    RelatedBooksComponent,
    StarRatingComponent,
    SpinnerComponent,
    ErrorStateComponent,
    TimeAgoPipe,
    CurrencyFormatPipe
  ],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-8">

      @if (isLoading()) {
        <app-spinner [center]="true" size="lg" />
      } @else if (error()) {
        <app-error-state
          title="Book not found"
          [message]="error()!"
          retryLabel="Back to Catalogue"
          (retry)="goToCatalogue()"
        />
      } @else if (book()) {

        <!-- Breadcrumb -->
        <app-breadcrumb [crumbs]="breadcrumbs()" />

        <!-- Main detail grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10 mt-2">

          <!-- Left: Cover image -->
          <div class="aspect-[3/4] max-h-[520px] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
            <img
              [src]="book()!.imageUrl || 'assets/placeholder-book.png'"
              [alt]="book()!.title"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Right: Info -->
          <div class="flex flex-col gap-5">

            <!-- Category + title -->
            <div>
              @if (category()) {
                <a
                  [routerLink]="['/catalogue', category()!.slug]"
                  class="text-xs font-semibold text-indigo-600 uppercase tracking-wide hover:underline">
                  {{ category()!.name }}
                </a>
              }
              <h1 class="text-3xl font-bold text-gray-900 mt-1 leading-tight">{{ book()!.title }}</h1>
              <p class="text-gray-500 mt-1">by <span class="font-medium text-gray-700">{{ book()!.author }}</span></p>
              @if (publisher()) {
                <p class="text-sm text-gray-400 mt-0.5">Published by {{ publisher()!.name }}</p>
              }
            </div>

            <!-- Rating -->
            <app-star-rating
              [rating]="book()!.rating"
              [reviewCount]="book()!.reviewCount"
              [showCount]="true"
            />

            <!-- Price + stock -->
            <div class="flex items-center gap-4">
              <span class="text-3xl font-extrabold text-gray-900">{{ book()!.price | currencyFormat }}</span>
              @if (book()!.stock > 0) {
                <span class="text-sm text-green-600 font-medium bg-green-50 border border-green-200 rounded-full px-3 py-0.5">
                  In Stock ({{ book()!.stock }} left)
                </span>
              } @else {
                <span class="text-sm text-red-600 font-medium bg-red-50 border border-red-200 rounded-full px-3 py-0.5">
                  Out of Stock
                </span>
              }
            </div>

            <!-- Delivery estimate -->
            <app-delivery-date-badge [estimatedDate]="estimatedDelivery()" />

            <!-- Add to cart -->
            <button
              (click)="onAddToCart()"
              [disabled]="book()!.stock === 0"
              class="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base">
              @if (book()!.stock === 0) {
                Out of Stock
              } @else {
                Add to Cart
              }
            </button>

            <!-- Metadata table -->
            <div class="border-t border-gray-200 pt-4 grid grid-cols-2 gap-y-2 text-sm">
              <span class="text-gray-500">ISBN</span>
              <span class="text-gray-800 font-medium">{{ book()!.isbn }}</span>
              <span class="text-gray-500">Published</span>
              <span class="text-gray-800 font-medium">{{ book()!.publishedDate | date:'mediumDate' }}</span>
              @if (publisher()) {
                <span class="text-gray-500">Publisher</span>
                <a
                  [routerLink]="['/catalogue/publisher', book()!.publisherId]"
                  class="text-indigo-600 hover:underline font-medium">
                  {{ publisher()!.name }}
                </a>
              }
            </div>
          </div>
        </div>

        <!-- Description -->
        <section class="mt-10">
          <h2 class="text-xl font-semibold text-gray-900 mb-3">About this book</h2>
          <p class="text-gray-600 leading-relaxed whitespace-pre-line">{{ book()!.description }}</p>
        </section>

        <!-- Related books -->
        @if (relatedBooks().length > 0) {
          <section class="mt-10">
            <app-related-books
              [books]="relatedBooks()"
              (addToCart)="onAddToCartBook($event)"
            />
          </section>
        }

        <!-- Reviews -->
        <section class="mt-10">
          <h2 class="text-xl font-semibold text-gray-900 mb-5">
            Customer Reviews
            @if (reviews().length > 0) {
              <span class="text-base font-normal text-gray-500 ml-2">({{ reviews().length }})</span>
            }
          </h2>

          @if (reviewsLoading()) {
            <app-spinner [center]="false" size="sm" />
          } @else if (reviews().length === 0) {
            <p class="text-gray-500 text-sm">No reviews yet. Be the first to review this book.</p>
          } @else {
            <div class="space-y-5">
              @for (review of reviews(); track review.id) {
                <div class="bg-white border border-gray-200 rounded-xl p-5">
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <p class="font-semibold text-gray-900 text-sm">{{ review.userName }}</p>
                      <app-star-rating [rating]="review.rating" [showCount]="false" />
                    </div>
                    <span class="text-xs text-gray-400 shrink-0">{{ review.createdAt | timeAgo }}</span>
                  </div>
                  @if (review.title) {
                    <p class="mt-2 font-medium text-gray-800 text-sm">{{ review.title }}</p>
                  }
                  <p class="mt-1 text-gray-600 text-sm leading-relaxed">{{ review.body }}</p>
                  @if (review.helpfulCount > 0) {
                    <p class="mt-3 text-xs text-gray-400">{{ review.helpfulCount }} people found this helpful</p>
                  }
                </div>
              }
            </div>
          }
        </section>

      }
    </div>
  `
})
export class ProductDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookService = inject(BookService);
  private readonly deliveryService = inject(DeliveryService);
  private readonly cartStore = inject(CartStore);
  private readonly toastStore = inject(ToastStore);
  private readonly http = inject(HttpClient);
  private readonly titleService = inject(Title);

  readonly book = signal<Book | null>(null);
  readonly category = signal<BookCategory | null>(null);
  readonly publisher = signal<Publisher | null>(null);
  readonly relatedBooks = signal<Book[]>([]);
  readonly reviews = signal<Review[]>([]);
  readonly estimatedDelivery = signal<string | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly reviewsLoading = signal(false);

  readonly breadcrumbs = signal<Breadcrumb[]>([
    { label: 'Home', path: '/home' },
    { label: 'Catalogue', path: '/catalogue' }
  ]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadBook(id);
  }

  private loadBook(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.bookService.getBookById(id).subscribe({
      next: book => {
        this.book.set(book);
        this.isLoading.set(false);
        this.titleService.setTitle(`${book.title} — BookStore`);
        this.loadCategory(book);
        this.loadPublisher(book.publisherId);
        this.loadRelatedBooks(book.categoryId, book.id);
        this.loadReviews(book.id);
        this.loadDeliveryEstimate(book.id, book.stock);
      },
      error: () => {
        this.isLoading.set(false);
        this.error.set('This book could not be found.');
        this.toastStore.add({ message: 'Book not found', type: 'error' });
        setTimeout(() => this.router.navigate(['/catalogue']), 2000);
      }
    });
  }

  private loadCategory(book: Book): void {
    this.http.get<BookCategory[]>('/api/categories').subscribe({
      next: cats => {
        const cat = cats.find(c => c.id === book.categoryId) ?? null;
        this.category.set(cat);
        if (cat) {
          this.breadcrumbs.set([
            { label: 'Home', path: '/home' },
            { label: 'Catalogue', path: '/catalogue' },
            { label: cat.name, path: `/catalogue/${cat.slug}` },
            { label: book.title }
          ]);
        } else {
          this.breadcrumbs.set([
            { label: 'Home', path: '/home' },
            { label: 'Catalogue', path: '/catalogue' },
            { label: book.title }
          ]);
        }
      },
      error: () => {}
    });
  }

  private loadPublisher(publisherId: string): void {
    this.http.get<Publisher[]>('/api/publishers').subscribe({
      next: pubs => this.publisher.set(pubs.find(p => p.id === publisherId) ?? null),
      error: () => {}
    });
  }

  private loadRelatedBooks(categoryId: string, excludeId: string): void {
    this.bookService.getBooks({ categoryId, _limit: 7 }).subscribe({
      next: books => this.relatedBooks.set(books.filter(b => b.id !== excludeId).slice(0, 6)),
      error: () => {}
    });
  }

  private loadReviews(bookId: string): void {
    this.reviewsLoading.set(true);
    const params = new HttpParams().set('bookId', bookId);
    this.http.get<Review[]>('/api/reviews', { params }).subscribe({
      next: reviews => {
        this.reviews.set(reviews);
        this.reviewsLoading.set(false);
      },
      error: () => this.reviewsLoading.set(false)
    });
  }

  private loadDeliveryEstimate(bookId: string, stock: number): void {
    this.deliveryService.getDeliveryEstimate(bookId, stock).subscribe({
      next: estimate => this.estimatedDelivery.set(estimate.estimatedDate),
      error: () => {}
    });
  }

  onAddToCart(): void {
    const b = this.book();
    if (!b || b.stock === 0) return;
    const item: CartItem = {
      bookId: b.id,
      title: b.title,
      author: b.author,
      price: b.price,
      quantity: 1,
      imageUrl: b.imageUrl,
      stock: b.stock
    };
    this.cartStore.addItem(item);
    this.toastStore.add({ message: `"${b.title}" added to cart`, type: 'success', duration: 3000 });
  }

  onAddToCartBook(book: Book): void {
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
    this.toastStore.add({ message: `"${book.title}" added to cart`, type: 'success', duration: 3000 });
  }

  goToCatalogue(): void {
    this.router.navigate(['/catalogue']);
  }
}
