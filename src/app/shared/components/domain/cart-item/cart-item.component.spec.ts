import { TestBed } from '@angular/core/testing';
import { CartItemComponent } from './cart-item.component';
import { CartItem } from '../../../../core/models/cart.model';

const mockItem: CartItem = {
  bookId: 'b1',
  title: 'Test Book',
  author: 'Author',
  price: 9.99,
  imageUrl: '',
  quantity: 2,
  stock: 5
};

describe('CartItemComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CartItemComponent]
    });
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(CartItemComponent);
    fixture.componentRef.setInput('item', mockItem);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('increment()', () => {
    it('emits quantityChange with quantity + 1', () => {
      const fixture = TestBed.createComponent(CartItemComponent);
      fixture.componentRef.setInput('item', mockItem);
      fixture.detectChanges();

      let emitted: any = null;
      fixture.componentInstance.quantityChange.subscribe((e: any) => { emitted = e; });
      fixture.componentInstance.increment();
      expect(emitted).toEqual({ bookId: 'b1', quantity: 3 });
    });
  });

  describe('decrement()', () => {
    it('emits quantityChange with quantity - 1 when quantity > 1', () => {
      const fixture = TestBed.createComponent(CartItemComponent);
      fixture.componentRef.setInput('item', mockItem);
      fixture.detectChanges();

      let emitted: any = null;
      fixture.componentInstance.quantityChange.subscribe((e: any) => { emitted = e; });
      fixture.componentInstance.decrement();
      expect(emitted).toEqual({ bookId: 'b1', quantity: 1 });
    });

    it('does not emit when quantity is already 1', () => {
      const fixture = TestBed.createComponent(CartItemComponent);
      fixture.componentRef.setInput('item', { ...mockItem, quantity: 1 });
      fixture.detectChanges();

      let emitted: any = null;
      fixture.componentInstance.quantityChange.subscribe((e: any) => { emitted = e; });
      fixture.componentInstance.decrement();
      expect(emitted).toBeNull();
    });
  });

  describe('remove output', () => {
    it('emitting remove passes the bookId', () => {
      const fixture = TestBed.createComponent(CartItemComponent);
      fixture.componentRef.setInput('item', mockItem);
      fixture.detectChanges();

      let emittedId = '';
      fixture.componentInstance.remove.subscribe((id: string) => { emittedId = id; });
      fixture.componentInstance.remove.emit(mockItem.bookId);
      expect(emittedId).toBe('b1');
    });
  });
});
