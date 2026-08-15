import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookSummary, Book } from '../../../../core/models/book.model';
import { BookCardComponent } from '../book-card/book-card.component';

@Component({
  selector: 'app-related-books',
  standalone: true,
  imports: [CommonModule, BookCardComponent],
  template: `
    @if (books().length > 0) {
      <section>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Related Books</h2>
        <div class="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          @for (book of books(); track book.id) {
            <div class="snap-start shrink-0 w-40">
              <app-book-card [book]="book" (addToCart)="addToCart.emit($event)" />
            </div>
          }
        </div>
      </section>
    }
  `
})
export class RelatedBooksComponent {
  readonly books = input<BookSummary[]>([]);
  readonly addToCart = output<Book>();
}
