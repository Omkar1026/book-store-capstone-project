import { TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalComponent]
    });
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(ModalComponent);
    fixture.componentRef.setInput('isOpen', false);
    fixture.componentRef.setInput('title', 'Test Modal');
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('onBackdropClick()', () => {
    it('emits close when closeOnBackdrop is true (default)', () => {
      const fixture = TestBed.createComponent(ModalComponent);
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('title', 'Test');
      fixture.detectChanges();

      let closeCalled = false;
      fixture.componentInstance.close.subscribe(() => { closeCalled = true; });
      fixture.componentInstance.onBackdropClick(new MouseEvent('click'));
      expect(closeCalled).toBeTrue();
    });

    it('does not emit close when closeOnBackdrop is false', () => {
      const fixture = TestBed.createComponent(ModalComponent);
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('title', 'Test');
      fixture.componentRef.setInput('closeOnBackdrop', false);
      fixture.detectChanges();

      let closeCalled = false;
      fixture.componentInstance.close.subscribe(() => { closeCalled = true; });
      fixture.componentInstance.onBackdropClick(new MouseEvent('click'));
      expect(closeCalled).toBeFalse();
    });
  });

  describe('closeable input', () => {
    it('defaults to true', () => {
      const fixture = TestBed.createComponent(ModalComponent);
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('title', 'Test');
      fixture.detectChanges();
      expect(fixture.componentInstance.closeable()).toBeTrue();
    });
  });
});
