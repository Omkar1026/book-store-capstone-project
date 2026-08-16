import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { OrderDetailPageComponent } from './order-detail-page.component';
import { OrderStore } from '../../../core/store/order.store';
import { CartStore } from '../../../core/store/cart.store';
import { Order } from '../../../core/models/order.model';
import { Address } from '../../../core/models/address.model';

const mockAddress: Address = {
  id: 'addr1', userId: 'u1', name: 'John', line1: '1 Main St',
  city: 'NY', state: 'NY', postcode: '10001', country: 'US', isDefault: true
};

const mockOrder: Order = {
  id: 'ord1', userId: 'u1', items: [], status: 'pending',
  placedAt: new Date().toISOString(),
  deliveryAddress: mockAddress, paymentMethod: 'credit_card',
  giftPointsUsed: 0, totalAmount: 19.99,
  deliveryInfo: { estimatedDate: '2024-01-10' }
};

describe('OrderDetailPageComponent', () => {
  let mockOrderStore: any;
  let mockCartStore: any;

  beforeEach(() => {
    mockOrderStore = {
      orders: signal<Order[]>([]),
      selectedOrder: signal<Order | null>(null),
      isLoading: signal(false),
      error: signal(null),
      loadOrder: jasmine.createSpy('loadOrder'),
      cancelOrder: jasmine.createSpy('cancelOrder')
    };

    mockCartStore = {
      cart: signal(null), items: signal([]),
      itemCount: signal(0), totalPrice: signal(0),
      isLoading: signal(false), error: signal(null),
      addItem: jasmine.createSpy('addItem')
    };

    TestBed.configureTestingModule({
      imports: [OrderDetailPageComponent],
      providers: [
        provideRouter([]),
        { provide: OrderStore, useValue: mockOrderStore },
        { provide: CartStore, useValue: mockCartStore },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'ord1' } } }
        }
      ]
    });
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(OrderDetailPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('loadOrder calls orderStore.loadOrder with route id', () => {
    const fixture = TestBed.createComponent(OrderDetailPageComponent);
    fixture.componentInstance.ngOnInit();
    expect(mockOrderStore.loadOrder).toHaveBeenCalledWith('ord1');
  });

  it('canCancel returns true for pending order within 48h', () => {
    const fixture = TestBed.createComponent(OrderDetailPageComponent);
    expect(fixture.componentInstance.canCancel(mockOrder)).toBeTrue();
  });

  it('canCancel returns false for delivered order', () => {
    const fixture = TestBed.createComponent(OrderDetailPageComponent);
    expect(fixture.componentInstance.canCancel({ ...mockOrder, status: 'delivered' })).toBeFalse();
  });

  it('canCancel returns false for orders placed more than 48h ago', () => {
    const old = new Date(Date.now() - 49 * 60 * 60 * 1000).toISOString();
    const fixture = TestBed.createComponent(OrderDetailPageComponent);
    expect(fixture.componentInstance.canCancel({ ...mockOrder, placedAt: old })).toBeFalse();
  });

  it('onCancelConfirm calls orderStore.cancelOrder and hides dialog', () => {
    const fixture = TestBed.createComponent(OrderDetailPageComponent);
    fixture.componentInstance.showCancelDialog.set(true);
    fixture.componentInstance.onCancelConfirm('ord1');
    expect(mockOrderStore.cancelOrder).toHaveBeenCalledWith('ord1');
    expect(fixture.componentInstance.showCancelDialog()).toBeFalse();
  });

  it('buyAgain adds each order item to cart and navigates to /cart', () => {
    const orderWithItems: Order = {
      ...mockOrder,
      items: [
        { bookId: 'b1', title: 'Book 1', author: 'A1', price: 9.99, imageUrl: '', quantity: 2 },
        { bookId: 'b2', title: 'Book 2', author: 'A2', price: 14.99, imageUrl: '', quantity: 1 }
      ]
    };
    const fixture = TestBed.createComponent(OrderDetailPageComponent);
    fixture.componentInstance.buyAgain(orderWithItems);
    expect(mockCartStore.addItem).toHaveBeenCalledTimes(2);
  });

  it('statusClass returns correct class for each status', () => {
    const fixture = TestBed.createComponent(OrderDetailPageComponent);
    const comp = fixture.componentInstance;
    expect(comp.statusClass('pending')).toContain('yellow');
    expect(comp.statusClass('processing')).toContain('blue');
    expect(comp.statusClass('shipped')).toContain('purple');
    expect(comp.statusClass('delivered')).toContain('green');
    expect(comp.statusClass('cancelled')).toContain('red');
  });
});
