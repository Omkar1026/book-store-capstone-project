import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { ProfilePageComponent } from './profile-page.component';
import { AuthStore } from '../../../core/store/auth.store';
import { User } from '../../../core/models/user.model';

const mockUser: User = {
  id: 'u1', email: 'test@example.com', name: 'Test User',
  addresses: [], giftPointsBalance: 0, orderHistory: [], createdAt: ''
};

describe('ProfilePageComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProfilePageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthStore,
          useValue: {
            currentUser: signal(mockUser),
            isAuthenticated: signal(true),
            isLoading: signal(false),
            error: signal(null),
            hydrate: jasmine.createSpy('hydrate')
          }
        }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(ProfilePageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('pre-populates form with current user data on ngOnInit', () => {
    const fixture = TestBed.createComponent(ProfilePageComponent);
    fixture.componentInstance.ngOnInit();
    expect(fixture.componentInstance.form.value.name).toBe('Test User');
    expect(fixture.componentInstance.form.value.email).toBe('test@example.com');
  });

  it('onSubmit does nothing when form is invalid', () => {
    const fixture = TestBed.createComponent(ProfilePageComponent);
    fixture.componentInstance.form.reset();
    fixture.componentInstance.onSubmit();
    httpMock.expectNone('/api/users/u1');
  });

  it('onSubmit calls updateProfile when form is valid', () => {
    const fixture = TestBed.createComponent(ProfilePageComponent);
    fixture.componentInstance.ngOnInit();
    fixture.componentInstance.form.setValue({ name: 'New Name', email: 'new@example.com' });
    fixture.componentInstance.onSubmit();
    const req = httpMock.expectOne('/api/users/u1');
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...mockUser, name: 'New Name', email: 'new@example.com' });
    expect(fixture.componentInstance.successMessage()).toBe('Profile updated successfully.');
  });

  it('sets errorMessage on failed update', () => {
    const fixture = TestBed.createComponent(ProfilePageComponent);
    fixture.componentInstance.ngOnInit();
    fixture.componentInstance.form.setValue({ name: 'New Name', email: 'new@example.com' });
    fixture.componentInstance.onSubmit();
    const req = httpMock.expectOne('/api/users/u1');
    req.flush(null, { status: 500, statusText: 'Error' });
    expect(fixture.componentInstance.errorMessage()).toBe('Failed to update profile. Please try again.');
  });
});
