import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookSummary, Book } from '../../../../core/models/book.model';
import { BookCardComponent } from '../book-card/book-card.component';
import { EmptyStateComponent } from '../../ui/empty-state/empty-state.component';

@Component({
  selector: 'app-book-grid',
  standalone: true,
  imports: [CommonModule, BookCardComponent, EmptyStateComponent],
  template: `
    @if (books().length === 0) {
      <app-empty-state
        icon="📚"
        title="No books found"
        message="Try adjusting your filters or search term."
      />
    } @else {
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        @for (book of books(); track book.id) {
          <app-book-card
            [book]="book"
            [outOfStock]="isOutOfStock(book.id)"
            (addToCart)="addToCart.emit($event)"
          />
        }
      </div>
    }
  `
})
export class BookGridComponent {
  readonly books = input<BookSummary[]>([]);
  readonly outOfStockIds = input<string[]>([]);
  readonly addToCart = output<Book>();

  isOutOfStock(bookId: string): boolean {
    return this.outOfStockIds().includes(bookId);
  }
}
