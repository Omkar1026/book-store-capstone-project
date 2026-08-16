import { TestBed } from '@angular/core/testing';
import { SidebarFilterComponent } from './sidebar-filter.component';

describe('SidebarFilterComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SidebarFilterComponent]
    });
  });

  function createComponent() {
    const fixture = TestBed.createComponent(SidebarFilterComponent);
    fixture.componentRef.setInput('categories', [
      { id: 'c1', name: 'Fiction' },
      { id: 'c2', name: 'Science' }
    ]);
    fixture.componentRef.setInput('publishers', [
      { id: 'p1', name: 'Penguin' }
    ]);
    fixture.componentRef.setInput('selectedCategoryId', null);
    fixture.componentRef.setInput('selectedPublisherId', null);
    fixture.detectChanges();
    return fixture;
  }

  it('creates the component', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('drawerOpen starts as false', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance.drawerOpen()).toBeFalse();
  });

  describe('setCategory()', () => {
    it('emits filterChange with the selected categoryId', () => {
      const fixture = createComponent();
      let emitted: any = null;
      fixture.componentInstance.filterChange.subscribe((s: any) => { emitted = s; });
      fixture.componentInstance.setCategory('c1');
      expect(emitted).toBeTruthy();
      expect(emitted.categoryId).toBe('c1');
    });

    it('emits filterChange with null categoryId when clearing', () => {
      const fixture = createComponent();
      let emitted: any = null;
      fixture.componentInstance.filterChange.subscribe((s: any) => { emitted = s; });
      fixture.componentInstance.setCategory(null);
      expect(emitted.categoryId).toBeNull();
    });
  });

  describe('setPublisher()', () => {
    it('emits filterChange with the selected publisherId', () => {
      const fixture = createComponent();
      let emitted: any = null;
      fixture.componentInstance.filterChange.subscribe((s: any) => { emitted = s; });
      fixture.componentInstance.setPublisher('p1');
      expect(emitted.publisherId).toBe('p1');
    });

    it('emits filterChange with null publisherId when clearing', () => {
      const fixture = createComponent();
      let emitted: any = null;
      fixture.componentInstance.filterChange.subscribe((s: any) => { emitted = s; });
      fixture.componentInstance.setPublisher(null);
      expect(emitted.publisherId).toBeNull();
    });
  });

  describe('applyFilters()', () => {
    it('emits filterChange with current price range and selected ids', () => {
      const fixture = createComponent();
      fixture.componentInstance.minPrice = 10;
      fixture.componentInstance.maxPrice = 50;
      let emitted: any = null;
      fixture.componentInstance.filterChange.subscribe((s: any) => { emitted = s; });
      fixture.componentInstance.applyFilters();
      expect(emitted.minPrice).toBe(10);
      expect(emitted.maxPrice).toBe(50);
    });
  });

  describe('resetFilters()', () => {
    it('clears minPrice and maxPrice and emits all-null filter', () => {
      const fixture = createComponent();
      fixture.componentInstance.minPrice = 5;
      fixture.componentInstance.maxPrice = 100;
      let emitted: any = null;
      fixture.componentInstance.filterChange.subscribe((s: any) => { emitted = s; });
      fixture.componentInstance.resetFilters();
      expect(fixture.componentInstance.minPrice).toBeNull();
      expect(fixture.componentInstance.maxPrice).toBeNull();
      expect(emitted).toEqual({ categoryId: null, publisherId: null, minPrice: null, maxPrice: null });
    });
  });
});
