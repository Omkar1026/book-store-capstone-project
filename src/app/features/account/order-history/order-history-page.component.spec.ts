import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { OrderHistoryPageComponent } from './order-history-page.component';
import { AuthStore } from '../../../core/store/auth.store';
import { OrderStore } from '../../../core/store/order.store';
import { Order } from '../../../core/models/order.model';
import { Address } from '../../../core/models/address.model';

const mockAddress: Address = {
  id: 'addr1', userId: 'u1', name: 'John', line1: '1 Main St',
  city: 'NY', state: 'NY', postcode: '10001', country: 'US', isDefault: true
};

const makeOrder = (id: string, placedAt: string): Order => ({
  id, userId: 'u1', items: [], status: 'pending', placedAt,
  deliveryAddress: mockAddress, paymentMethod: 'credit_card',
  giftPointsUsed: 0, totalAmount: 10,
  deliveryInfo: { estimatedDate: '2024-01-10' }
});

describe('OrderHistoryPageComponent', () => {
  let mockOrderStore: any;

  beforeEach(() => {
    mockOrderStore = {
      orders: signal<Order[]>([]),
      selectedOrder: signal(null),
      isLoading: signal(false),
      error: signal(null),
      loadOrders: jasmine.createSpy('loadOrders')
    };

    TestBed.configureTestingModule({
      imports: [OrderHistoryPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthStore,
          useValue: {
            currentUser: signal({ id: 'u1', name: 'Test', email: '', addresses: [], giftPointsBalance: 0, orderHistory: [], createdAt: '' }),
            isAuthenticated: signal(true),
            isLoading: signal(false),
            error: signal(null),
            hydrate: jasmine.createSpy('hydrate')
          }
        },
        { provide: OrderStore, useValue: mockOrderStore }
      ]
    });
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(OrderHistoryPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('calls orderStore.loadOrders on ngOnInit with the current user id', () => {
    const fixture = TestBed.createComponent(OrderHistoryPageComponent);
    fixture.componentInstance.ngOnInit();
    expect(mockOrderStore.loadOrders).toHaveBeenCalledWith('u1');
  });

  it('sortedOrders returns orders sorted newest first', () => {
    const older = makeOrder('o1', '2024-01-01T00:00:00Z');
    const newer = makeOrder('o2', '2024-06-01T00:00:00Z');
    mockOrderStore.orders.set([older, newer]);
    const fixture = TestBed.createComponent(OrderHistoryPageComponent);
    const sorted = fixture.componentInstance.sortedOrders();
    expect(sorted[0].id).toBe('o2');
    expect(sorted[1].id).toBe('o1');
  });
});
