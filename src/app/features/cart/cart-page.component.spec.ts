import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal, computed } from '@angular/core';
import { CartPageComponent } from './cart-page.component';
import { CartStore } from '../../core/store/cart.store';

describe('CartPageComponent', () => {
  let mockCartStore: any;

  beforeEach(() => {
    mockCartStore = {
      cart: signal(null),
      items: signal([]),
      itemCount: signal(0),
      totalPrice: signal(0),
      isLoading: signal(false),
      error: signal(null),
      updateQty: jasmine.createSpy('updateQty'),
      removeItem: jasmine.createSpy('removeItem')
    };

    TestBed.configureTestingModule({
      imports: [CartPageComponent],
      providers: [
        provideRouter([]),
        { provide: CartStore, useValue: mockCartStore }
      ]
    });
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(CartPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('ngOnInit sets the page title', () => {
    const fixture = TestBed.createComponent(CartPageComponent);
    fixture.componentInstance.ngOnInit();
    // just verify no exceptions thrown
  });

  it('onQtyChange delegates to cartStore.updateQty', () => {
    const fixture = TestBed.createComponent(CartPageComponent);
    fixture.componentInstance.onQtyChange({ bookId: 'b1', quantity: 3 });
    expect(mockCartStore.updateQty).toHaveBeenCalledWith('b1', 3);
  });

  it('onRemove delegates to cartStore.removeItem', () => {
    const fixture = TestBed.createComponent(CartPageComponent);
    fixture.componentInstance.onRemove('b1');
    expect(mockCartStore.removeItem).toHaveBeenCalledWith('b1');
  });

  it('orderSummary computes shipping as 0 when subtotal >= 35', () => {
    mockCartStore.totalPrice.set(50);
    const fixture = TestBed.createComponent(CartPageComponent);
    const summary = fixture.componentInstance.orderSummary();
    expect(summary.shipping).toBe(0);
    expect(summary.total).toBe(50);
  });

  it('orderSummary computes shipping as 4.99 when subtotal < 35', () => {
    mockCartStore.totalPrice.set(20);
    const fixture = TestBed.createComponent(CartPageComponent);
    const summary = fixture.componentInstance.orderSummary();
    expect(summary.shipping).toBe(4.99);
    expect(summary.total).toBeCloseTo(24.99, 2);
  });
});
