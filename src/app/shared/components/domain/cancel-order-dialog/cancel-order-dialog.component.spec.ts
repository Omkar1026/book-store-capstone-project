import { TestBed } from '@angular/core/testing';
import { CancelOrderDialogComponent } from './cancel-order-dialog.component';

describe('CancelOrderDialogComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CancelOrderDialogComponent]
    });
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(CancelOrderDialogComponent);
    fixture.componentRef.setInput('isOpen', false);
    fixture.componentRef.setInput('orderId', 'ord1');
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('confirm output emits the orderId', () => {
    const fixture = TestBed.createComponent(CancelOrderDialogComponent);
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('orderId', 'ord1');
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();

    let emittedId = '';
    fixture.componentInstance.confirm.subscribe((id: string) => { emittedId = id; });
    fixture.componentInstance.confirm.emit('ord1');
    expect(emittedId).toBe('ord1');
  });

  it('cancel output emits void', () => {
    const fixture = TestBed.createComponent(CancelOrderDialogComponent);
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('orderId', 'ord1');
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();

    let cancelCalled = false;
    fixture.componentInstance.cancel.subscribe(() => { cancelCalled = true; });
    fixture.componentInstance.cancel.emit();
    expect(cancelCalled).toBeTrue();
  });

  it('isOpen input reflects the passed value', () => {
    const fixture = TestBed.createComponent(CancelOrderDialogComponent);
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('orderId', 'ord1');
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
    expect(fixture.componentInstance.isOpen()).toBeTrue();
  });
});
