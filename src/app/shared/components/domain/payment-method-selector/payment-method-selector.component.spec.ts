import { TestBed } from '@angular/core/testing';
import { PaymentMethodSelectorComponent } from './payment-method-selector.component';
import { PaymentMethod } from '../../../../core/models/payment.model';

const mockMethods: PaymentMethod[] = [
  { id: 'pm1', userId: 'u1', type: 'credit_card', last4: '4242', isDefault: true },
  { id: 'pm2', userId: 'u1', type: 'paypal', isDefault: false }
];

describe('PaymentMethodSelectorComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PaymentMethodSelectorComponent]
    });
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(PaymentMethodSelectorComponent);
    fixture.componentRef.setInput('methods', mockMethods);
    fixture.componentRef.setInput('selectedId', null);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('methodIcon()', () => {
    it('returns 💳 for credit_card', () => {
      const fixture = TestBed.createComponent(PaymentMethodSelectorComponent);
      fixture.componentRef.setInput('methods', []);
      fixture.componentRef.setInput('selectedId', null);
      fixture.detectChanges();
      expect(fixture.componentInstance.methodIcon('credit_card')).toBe('💳');
    });

    it('returns 🅿️ for paypal', () => {
      const fixture = TestBed.createComponent(PaymentMethodSelectorComponent);
      fixture.componentRef.setInput('methods', []);
      fixture.componentRef.setInput('selectedId', null);
      fixture.detectChanges();
      expect(fixture.componentInstance.methodIcon('paypal')).toBe('🅿️');
    });
  });

  describe('methodLabel()', () => {
    it('returns "PayPal" for paypal method', () => {
      const fixture = TestBed.createComponent(PaymentMethodSelectorComponent);
      fixture.componentRef.setInput('methods', mockMethods);
      fixture.componentRef.setInput('selectedId', null);
      fixture.detectChanges();
      const paypalMethod = mockMethods[1];
      expect(fixture.componentInstance.methodLabel(paypalMethod)).toBe('PayPal');
    });

    it('returns "Credit Card ending in 4242" for credit_card with last4', () => {
      const fixture = TestBed.createComponent(PaymentMethodSelectorComponent);
      fixture.componentRef.setInput('methods', mockMethods);
      fixture.componentRef.setInput('selectedId', null);
      fixture.detectChanges();
      expect(fixture.componentInstance.methodLabel(mockMethods[0])).toBe('Credit Card ending in 4242');
    });

    it('returns "Credit Card" when no last4', () => {
      const fixture = TestBed.createComponent(PaymentMethodSelectorComponent);
      fixture.componentRef.setInput('methods', mockMethods);
      fixture.componentRef.setInput('selectedId', null);
      fixture.detectChanges();
      const method: PaymentMethod = { id: 'pm3', userId: 'u1', type: 'credit_card', isDefault: false };
      expect(fixture.componentInstance.methodLabel(method)).toBe('Credit Card');
    });
  });

  describe('select output', () => {
    it('emits the method id', () => {
      const fixture = TestBed.createComponent(PaymentMethodSelectorComponent);
      fixture.componentRef.setInput('methods', mockMethods);
      fixture.componentRef.setInput('selectedId', null);
      fixture.detectChanges();

      let emitted = '';
      fixture.componentInstance.select.subscribe((id: string) => { emitted = id; });
      fixture.componentInstance.select.emit('pm1');
      expect(emitted).toBe('pm1');
    });
  });
});
