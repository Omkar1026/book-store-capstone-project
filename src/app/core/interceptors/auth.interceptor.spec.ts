import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useValue: {
            intercept: authInterceptor
          },
          multi: true
        }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('attaches Authorization header when token exists', () => {
    localStorage.setItem('token', 'my-token');
    const mockReq = {
      clone: jasmine.createSpy('clone').and.callFake((opts: any) => ({ ...opts, headers: opts.setHeaders })),
      headers: {}
    } as any;
    const next = jasmine.createSpy('next').and.returnValue({ subscribe: () => {} });

    TestBed.runInInjectionContext(() => {
      authInterceptor(mockReq, next);
    });

    expect(next).toHaveBeenCalled();
    expect(mockReq.clone).toHaveBeenCalledWith({
      setHeaders: { Authorization: 'Bearer my-token' }
    });
  });

  it('does not attach Authorization header when no token', () => {
    const mockReq = {
      clone: jasmine.createSpy('clone'),
      headers: {}
    } as any;
    const next = jasmine.createSpy('next').and.returnValue({ subscribe: () => {} });

    TestBed.runInInjectionContext(() => {
      authInterceptor(mockReq, next);
    });

    expect(next).toHaveBeenCalledWith(mockReq);
    expect(mockReq.clone).not.toHaveBeenCalled();
  });
});
