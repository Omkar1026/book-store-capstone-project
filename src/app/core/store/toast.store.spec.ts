import { TestBed } from '@angular/core/testing';
import { ToastStore } from './toast.store';
import { fakeAsync, tick } from '@angular/core/testing';

describe('ToastStore', () => {
  let store: InstanceType<typeof ToastStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToastStore]
    });
    store = TestBed.inject(ToastStore);
  });

  it('has correct initial state', () => {
    expect(store.toasts()).toEqual([]);
  });

  describe('add()', () => {
    it('adds a toast to the list', () => {
      store.add({ type: 'success', message: 'Done!' });
      expect(store.toasts().length).toBe(1);
      expect(store.toasts()[0].type).toBe('success');
      expect(store.toasts()[0].message).toBe('Done!');
      expect(store.toasts()[0].id).toBeTruthy();
    });

    it('auto-removes toast after default 4s', fakeAsync(() => {
      store.add({ type: 'info', message: 'Auto-remove' });
      expect(store.toasts().length).toBe(1);
      tick(4000);
      expect(store.toasts().length).toBe(0);
    }));

    it('auto-removes toast after custom duration', fakeAsync(() => {
      store.add({ type: 'info', message: 'Custom', duration: 1000 });
      tick(999);
      expect(store.toasts().length).toBe(1);
      tick(1);
      expect(store.toasts().length).toBe(0);
    }));
  });

  describe('remove()', () => {
    it('removes a specific toast by id', () => {
      store.add({ type: 'success', message: 'First', duration: 0 });
      store.add({ type: 'error', message: 'Second', duration: 0 });
      const id = store.toasts()[0].id;
      store.remove(id);
      expect(store.toasts().length).toBe(1);
      expect(store.toasts()[0].message).toBe('Second');
    });
  });

  describe('clear()', () => {
    it('removes all toasts', () => {
      store.add({ type: 'success', message: 'First', duration: 0 });
      store.add({ type: 'info', message: 'Second', duration: 0 });
      store.clear();
      expect(store.toasts()).toEqual([]);
    });
  });
});
