import { TestBed } from '@angular/core/testing';
import { throwError, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { errorInterceptor } from './error.interceptor';
import { ToastService } from '../services/toast.service';

describe('errorInterceptor', () => {
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    const toastSpy = jasmine.createSpyObj('ToastService', ['error']);

    TestBed.configureTestingModule({
      providers: [
        { provide: ToastService, useValue: toastSpy }
      ]
    });

    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
  });

  it('calls toastService.error on HTTP error response', () => {
    const httpError = new HttpErrorResponse({
      error: { message: 'Unauthorized access' },
      status: 401,
      statusText: 'Unauthorized'
    });

    const next = jasmine.createSpy('next').and.returnValue(throwError(() => httpError));
    const mockReq = {} as any;
    let errorCaught = false;

    TestBed.runInInjectionContext(() => {
      errorInterceptor(mockReq, next).subscribe({
        error: () => { errorCaught = true; }
      });
    });

    expect(errorCaught).toBeTrue();
    expect(toastService.error).toHaveBeenCalledWith('Unauthorized access');
  });

  it('calls toastService.error with error string message', () => {
    const httpError = new HttpErrorResponse({
      error: 'Service unavailable',
      status: 503,
      statusText: 'Service Unavailable'
    });

    const next = jasmine.createSpy('next').and.returnValue(throwError(() => httpError));
    const mockReq = {} as any;

    TestBed.runInInjectionContext(() => {
      errorInterceptor(mockReq, next).subscribe({ error: () => {} });
    });

    expect(toastService.error).toHaveBeenCalledWith('Service unavailable');
  });

  it('passes through on successful response', () => {
    const mockResponse = { data: 'ok' };
    const next = jasmine.createSpy('next').and.returnValue(of(mockResponse));
    const mockReq = {} as any;
    let receivedData: any;

    TestBed.runInInjectionContext(() => {
      errorInterceptor(mockReq, next).subscribe(data => {
        receivedData = data;
      });
    });

    expect(receivedData).toEqual(mockResponse);
    expect(toastService.error).not.toHaveBeenCalled();
  });
});
