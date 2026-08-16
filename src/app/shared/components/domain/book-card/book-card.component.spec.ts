import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BookCardComponent } from './book-card.component';
import { BookSummary } from '../../../../core/models/book.model';

const mockBook: BookSummary = {
  id: 'b1',
  title: 'Test Book',
  author: 'Author',
  price: 9.99,
  imageUrl: '',
  rating: 4.5,
  categoryId: 'c1'
};

describe('BookCardComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BookCardComponent],
      providers: [provideRouter([])]
    });
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(BookCardComponent);
    fixture.componentRef.setInput('book', mockBook);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('bookAsFull() returns a Book-shaped object with default fields', () => {
    const fixture = TestBed.createComponent(BookCardComponent);
    fixture.componentRef.setInput('book', mockBook);
    fixture.detectChanges();
    const full = fixture.componentInstance.bookAsFull();
    expect(full.id).toBe('b1');
    expect(full.title).toBe('Test Book');
    expect(full.publisherId).toBe('');
    expect(full.tags).toEqual([]);
  });

  it('emits addToCart with the full book when button is clicked', () => {
    const fixture = TestBed.createComponent(BookCardComponent);
    fixture.componentRef.setInput('book', mockBook);
    fixture.componentRef.setInput('outOfStock', false);
    fixture.detectChanges();

    let emitted: any = null;
    fixture.componentInstance.addToCart.subscribe((b: any) => { emitted = b; });
    fixture.componentInstance.addToCart.emit(fixture.componentInstance.bookAsFull());
    expect(emitted).toBeTruthy();
    expect(emitted.id).toBe('b1');
  });

  it('outOfStock defaults to false', () => {
    const fixture = TestBed.createComponent(BookCardComponent);
    fixture.componentRef.setInput('book', mockBook);
    fixture.detectChanges();
    expect(fixture.componentInstance.outOfStock()).toBeFalse();
  });
});
