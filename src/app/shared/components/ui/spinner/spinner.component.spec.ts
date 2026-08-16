import { TestBed } from '@angular/core/testing';
import { SpinnerComponent } from './spinner.component';

describe('SpinnerComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SpinnerComponent]
    });
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(SpinnerComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('svgClass getter', () => {
    it('returns h-4 w-4 for sm size', () => {
      const fixture = TestBed.createComponent(SpinnerComponent);
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();
      expect(fixture.componentInstance.svgClass).toBe('h-4 w-4');
    });

    it('returns h-8 w-8 for md size (default)', () => {
      const fixture = TestBed.createComponent(SpinnerComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.svgClass).toBe('h-8 w-8');
    });

    it('returns h-12 w-12 for lg size', () => {
      const fixture = TestBed.createComponent(SpinnerComponent);
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();
      expect(fixture.componentInstance.svgClass).toBe('h-12 w-12');
    });
  });

  describe('containerClass getter', () => {
    it('returns centered class when center is true', () => {
      const fixture = TestBed.createComponent(SpinnerComponent);
      fixture.componentRef.setInput('center', true);
      fixture.detectChanges();
      expect(fixture.componentInstance.containerClass).toContain('flex justify-center');
    });

    it('returns inline-flex when center is false', () => {
      const fixture = TestBed.createComponent(SpinnerComponent);
      fixture.componentRef.setInput('center', false);
      fixture.detectChanges();
      expect(fixture.componentInstance.containerClass).toBe('inline-flex');
    });
  });
});
