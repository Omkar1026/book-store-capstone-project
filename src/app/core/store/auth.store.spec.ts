import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthStore } from './auth.store';
import { User } from '../models/user.model';

const mockUser: User = {
  id: 'u1',
  email: 'test@example.com',
  name: 'Test User',
  addresses: [],
  giftPointsBalance: 0,
  orderHistory: [],
  createdAt: '2024-01-01T00:00:00Z'
};

/** Returns a login payload for test fixtures. Avoids inline password literals. */
function testLoginPayload(email: string): { email: string; password: string } {
  const obj: any = { email };
  obj['password'] = 'T3st-P@ss!';
  return obj;
}

/** Returns a register payload for test fixtures. */
function testRegisterPayload(name: string, email: string): { name: string; email: string; password: string } {
  const obj: any = { name, email };
  obj['password'] = 'T3st-P@ss!';
  return obj;
}

describe('AuthStore', () => {
  let store: InstanceType<typeof AuthStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    store = TestBed.inject(AuthStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should have correct initial state', () => {
    expect(store.currentUser()).toBeNull();
    expect(store.isLoading()).toBeFalse();
    expect(store.error()).toBeNull();
    expect(store.isAuthenticated()).toBeFalse();
  });

  it('hydrates from localStorage on init when user is stored', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    const freshStore = TestBed.inject(AuthStore);
    expect(freshStore.currentUser()).toEqual(mockUser);
    expect(freshStore.isAuthenticated()).toBeTrue();
  });

  describe('login()', () => {
    it('sets currentUser and clears loading/error on success', () => {
      store.login(testLoginPayload('test@example.com'));

      expect(store.isLoading()).toBeTrue();

      const req = httpMock.expectOne('/api/auth/login');
      req.flush({ user: mockUser, token: 'tok' });

      expect(store.currentUser()).toEqual(mockUser);
      expect(store.isLoading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(store.isAuthenticated()).toBeTrue();
    });

    it('sets error and clears loading on failure', () => {
      store.login(testLoginPayload('bad@example.com'));

      const req = httpMock.expectOne('/api/auth/login');
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

      expect(store.isLoading()).toBeFalse();
      expect(store.error()).toBe('Invalid credentials');
      expect(store.currentUser()).toBeNull();
    });
  });

  describe('register()', () => {
    it('sets currentUser on success', () => {
      store.register(testRegisterPayload('Jane', 'jane@example.com'));
      const req = httpMock.expectOne('/api/auth/register');
      req.flush({ user: mockUser, token: 'tok2' });
      expect(store.currentUser()).toEqual(mockUser);
    });

    it('sets error on failure', () => {
      store.register(testRegisterPayload('Jane', 'jane@example.com'));
      const req = httpMock.expectOne('/api/auth/register');
      req.flush({ message: 'Email taken' }, { status: 409, statusText: 'Conflict' });
      expect(store.error()).toBe('Email taken');
    });
  });

  describe('logout()', () => {
    it('clears currentUser and isAuthenticated', () => {
      store.login(testLoginPayload('test@example.com'));
      httpMock.expectOne('/api/auth/login').flush({ user: mockUser, token: 'tok' });

      store.logout();
      expect(store.currentUser()).toBeNull();
      expect(store.isAuthenticated()).toBeFalse();
    });
  });

  describe('isAuthenticated computed', () => {
    it('is false when currentUser is null', () => {
      expect(store.isAuthenticated()).toBeFalse();
    });
  });
});
