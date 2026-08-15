import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookSummary, Book } from '../../../../core/models/book.model';
import { StarRatingComponent } from '../../ui/star-rating/star-rating.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { TruncatePipe } from '../../../pipes/truncate.pipe';
import { CurrencyFormatPipe } from '../../../pipes/currency-format.pipe';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule, RouterLink, StarRatingComponent, ButtonComponent, TruncatePipe, CurrencyFormatPipe],
  template: `
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow h-full">
      <!-- Cover image -->
      <a [routerLink]="['/products', book().id]" class="block aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          [src]="book().imageUrl || 'assets/placeholder-book.png'"
          [alt]="book().title"
          class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </a>

      <!-- Details -->
      <div class="p-4 flex flex-col flex-1 gap-2">
        <a [routerLink]="['/products', book().id]">
          <h3 class="text-sm font-semibold text-gray-900 leading-snug hover:text-indigo-600 transition-colors">
            {{ book().title | truncate:50 }}
          </h3>
        </a>
        <p class="text-xs text-gray-500">{{ book().author }}</p>

        <app-star-rating [rating]="book().rating" [showCount]="false" class="mt-auto" />

        <div class="flex items-center justify-between mt-1">
          <span class="text-base font-bold text-gray-900">{{ book().price | currencyFormat }}</span>
          <app-button
            variant="primary"
            size="sm"
            (click)="addToCart.emit(bookAsFull())"
            [disabled]="outOfStock()">
            {{ outOfStock() ? 'Out of Stock' : 'Add to Cart' }}
          </app-button>
        </div>
      </div>
    </div>
  `
})
export class BookCardComponent {
  readonly book = input.required<BookSummary>();
  readonly addToCart = output<Book>();

  readonly outOfStock = input<boolean>(false);

  /** Cast BookSummary → partial Book for emit; callers can enrich if needed */
  bookAsFull(): Book {
    const b = this.book();
    return {
      id: b.id,
      title: b.title,
      author: b.author,
      price: b.price,
      imageUrl: b.imageUrl,
      rating: b.rating,
      categoryId: b.categoryId,
      publisherId: '',
      stock: 0,
      reviewCount: 0,
      description: '',
      isbn: '',
      publishedDate: '',
      tags: []
    };
  }
}
