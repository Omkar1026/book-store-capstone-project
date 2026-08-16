import { ToastService } from './toast.service';
import { fakeAsync, tick } from '@angular/core/testing';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    service = new ToastService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('starts with empty toasts', () => {
    expect(service.toasts()).toEqual([]);
  });

  describe('show()', () => {
    it('adds a toast with the given message and type', () => {
      service.show('Hello', 'success');
      expect(service.toasts().length).toBe(1);
      expect(service.toasts()[0].message).toBe('Hello');
      expect(service.toasts()[0].type).toBe('success');
    });

    it('auto-removes the toast after the duration', fakeAsync(() => {
      service.show('Temp', 'info', 1000);
      expect(service.toasts().length).toBe(1);
      tick(1000);
      expect(service.toasts().length).toBe(0);
    }));

    it('does not auto-remove when duration is 0', fakeAsync(() => {
      service.show('Persistent', 'warning', 0);
      tick(10000);
      expect(service.toasts().length).toBe(1);
    }));
  });

  describe('success()', () => {
    it('adds a success toast', () => {
      service.success('Done!');
      expect(service.toasts()[0].type).toBe('success');
    });
  });

  describe('error()', () => {
    it('adds an error toast', () => {
      service.error('Oops!');
      expect(service.toasts()[0].type).toBe('error');
    });
  });

  describe('info()', () => {
    it('adds an info toast', () => {
      service.info('FYI');
      expect(service.toasts()[0].type).toBe('info');
    });
  });

  describe('warning()', () => {
    it('adds a warning toast', () => {
      service.warning('Careful!');
      expect(service.toasts()[0].type).toBe('warning');
    });
  });

  describe('remove()', () => {
    it('removes the toast with the given id', () => {
      service.show('First', 'info', 0);
      service.show('Second', 'info', 0);
      const id = service.toasts()[0].id;
      service.remove(id);
      expect(service.toasts().length).toBe(1);
      expect(service.toasts()[0].message).toBe('Second');
    });
  });
});
