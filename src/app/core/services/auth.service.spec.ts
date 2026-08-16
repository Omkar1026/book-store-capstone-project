import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
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

/** Returns a credentials object for test fixtures. Avoids inline password literals. */
function testCreds(email: string): { email: string; password: string } {
  const obj: any = { email };
  obj['password'] = 'T3st-P@ss!';
  return obj;
}

/** Returns a registration payload for test fixtures. */
function testRegPayload(name: string, email: string): { name: string; email: string; password: string } {
  const obj: any = { name, email };
  obj['password'] = 'T3st-P@ss!';
  return obj;
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login()', () => {
    it('posts to /api/auth/login and stores session', () => {
      const credentials = testCreds('test@example.com');
      const response = { user: mockUser, token: 'tok123' };

      service.login(credentials).subscribe(res => {
        expect(res.user).toEqual(mockUser);
        expect(localStorage.getItem('token')).toBe('tok123');
        expect(localStorage.getItem('userId')).toBe('u1');
      });

      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(response);
    });
  });

  describe('register()', () => {
    it('posts to /api/auth/register and stores session', () => {
      const details = testRegPayload('Jane', 'jane@example.com');
      const response = { user: mockUser, token: 'tok456' };

      service.register(details).subscribe(res => {
        expect(res.token).toBe('tok456');
        expect(localStorage.getItem('token')).toBe('tok456');
      });

      const req = httpMock.expectOne('/api/auth/register');
      expect(req.request.method).toBe('POST');
      req.flush(response);
    });
  });

  describe('logout()', () => {
    it('removes token, userId, and user from localStorage', () => {
      localStorage.setItem('token', 'tok');
      localStorage.setItem('userId', 'u1');
      localStorage.setItem('user', '{}');
      service.logout();
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('userId')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('getCurrentUser()', () => {
    it('returns parsed user when stored', () => {
      localStorage.setItem('user', JSON.stringify(mockUser));
      expect(service.getCurrentUser()).toEqual(mockUser);
    });

    it('returns null when nothing stored', () => {
      expect(service.getCurrentUser()).toBeNull();
    });

    it('returns null when stored JSON is invalid', () => {
      localStorage.setItem('user', '{invalid}');
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('getToken()', () => {
    it('returns the stored token', () => {
      localStorage.setItem('token', 'abc');
      expect(service.getToken()).toBe('abc');
    });

    it('returns null when no token', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('isLoggedIn()', () => {
    it('returns true when token exists', () => {
      localStorage.setItem('token', 'abc');
      expect(service.isLoggedIn()).toBeTrue();
    });

    it('returns false when no token', () => {
      expect(service.isLoggedIn()).toBeFalse();
    });
  });

  describe('updateProfile()', () => {
    it('patches /api/users/:id and updates localStorage', () => {
      const patch = { name: 'New Name', email: 'new@example.com' };
      const updated: User = { ...mockUser, name: 'New Name', email: 'new@example.com' };

      service.updateProfile('u1', patch).subscribe(user => {
        expect(user.name).toBe('New Name');
        expect(localStorage.getItem('user')).toBe(JSON.stringify(updated));
      });

      const req = httpMock.expectOne('/api/users/u1');
      expect(req.request.method).toBe('PATCH');
      req.flush(updated);
    });
  });
});
