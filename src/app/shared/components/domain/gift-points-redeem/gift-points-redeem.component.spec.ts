import { TestBed } from '@angular/core/testing';
import { GiftPointsRedeemComponent } from './gift-points-redeem.component';

describe('GiftPointsRedeemComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GiftPointsRedeemComponent]
    });
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(GiftPointsRedeemComponent);
    fixture.componentRef.setInput('balance', 500);
    fixture.componentRef.setInput('appliedPoints', 0);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('applyPoints()', () => {
    it('emits balance when pointsToRedeem exceeds balance', () => {
      const fixture = TestBed.createComponent(GiftPointsRedeemComponent);
      fixture.componentRef.setInput('balance', 100);
      fixture.componentRef.setInput('appliedPoints', 0);
      fixture.detectChanges();

      let emitted = -1;
      fixture.componentInstance.redeem.subscribe((v: number) => { emitted = v; });
      fixture.componentInstance.pointsToRedeem = 200;
      fixture.componentInstance.applyPoints();
      expect(emitted).toBe(100); // capped at balance
    });

    it('emits the requested points when within balance', () => {
      const fixture = TestBed.createComponent(GiftPointsRedeemComponent);
      fixture.componentRef.setInput('balance', 500);
      fixture.componentRef.setInput('appliedPoints', 0);
      fixture.detectChanges();

      let emitted = -1;
      fixture.componentInstance.redeem.subscribe((v: number) => { emitted = v; });
      fixture.componentInstance.pointsToRedeem = 150;
      fixture.componentInstance.applyPoints();
      expect(emitted).toBe(150);
    });

    it('does not emit when pointsToRedeem is null or 0', () => {
      const fixture = TestBed.createComponent(GiftPointsRedeemComponent);
      fixture.componentRef.setInput('balance', 500);
      fixture.componentRef.setInput('appliedPoints', 0);
      fixture.detectChanges();

      let emitted = -1;
      fixture.componentInstance.redeem.subscribe((v: number) => { emitted = v; });
      fixture.componentInstance.pointsToRedeem = null;
      fixture.componentInstance.applyPoints();
      expect(emitted).toBe(-1); // not called
    });
  });

  describe('appliedDiscount getter', () => {
    it('divides appliedPoints by 100', () => {
      const fixture = TestBed.createComponent(GiftPointsRedeemComponent);
      fixture.componentRef.setInput('balance', 500);
      fixture.componentRef.setInput('appliedPoints', 300);
      fixture.detectChanges();
      expect(fixture.componentInstance.appliedDiscount).toBe(3);
    });
  });
});
