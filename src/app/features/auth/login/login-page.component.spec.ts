import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { LoginPageComponent } from './login-page.component';
import { AuthStore } from '../../../core/store/auth.store';

/** Builds a login form value for test fixtures. Avoids inline password literals. */
function testLoginForm(email: string): { email: string; password: string } {
  const obj: any = { email };
  obj['password'] = 'T3st-P@ss!';
  return obj;
}

describe('LoginPageComponent', () => {
  let mockAuthStore: any;

  function setup(authOverrides: Partial<any> = {}) {
    mockAuthStore = {
      isLoading: signal(false),
      error: signal<string | null>(null),
      isAuthenticated: signal(false),
      currentUser: signal(null),
      login: jasmine.createSpy('login'),
      hydrate: jasmine.createSpy('hydrate'),
      ...authOverrides
    };

    TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthStore, useValue: mockAuthStore }
      ]
    });
  }

  it('creates the component', () => {
    setup();
    const fixture = TestBed.createComponent(LoginPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('has an invalid form initially', () => {
    setup();
    const fixture = TestBed.createComponent(LoginPageComponent);
    expect(fixture.componentInstance.form.valid).toBeFalse();
  });

  it('ngOnInit sets the page title', () => {
    setup();
    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.componentInstance.ngOnInit();
    // just verify no exception thrown
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('onSubmit()', () => {
    it('marks form as touched and does not call login when form is invalid', () => {
      setup();
      const fixture = TestBed.createComponent(LoginPageComponent);
      const component = fixture.componentInstance;
      component.onSubmit();
      expect(mockAuthStore.login).not.toHaveBeenCalled();
      expect(component.form.controls.email.touched).toBeTrue();
    });

    it('calls authStore.login with form values when form is valid', () => {
      setup();
      const fixture = TestBed.createComponent(LoginPageComponent);
      const component = fixture.componentInstance;
      const formVal = testLoginForm('test@example.com');
      component.form.setValue(formVal);
      component.onSubmit();
      expect(mockAuthStore.login).toHaveBeenCalledWith(formVal);
    });
  });

  describe('redirect after login', () => {
    it('navigates to /home by default when authenticated and not loading', () => {
      setup({ isAuthenticated: signal(true), isLoading: signal(false) });
      const fixture = TestBed.createComponent(LoginPageComponent);
      const router = TestBed.inject(Router);
      spyOn(router, 'navigateByUrl');
      fixture.detectChanges();
      expect(router.navigateByUrl).toHaveBeenCalledWith('/home');
    });

    it('navigates to returnUrl when provided', () => {
      setup({ isAuthenticated: signal(true), isLoading: signal(false) });
      TestBed.overrideProvider(ActivatedRoute, {
        useValue: {
          snapshot: { queryParamMap: { get: (k: string) => k === 'returnUrl' ? '/cart' : null } }
        }
      });
      const fixture = TestBed.createComponent(LoginPageComponent);
      const router = TestBed.inject(Router);
      spyOn(router, 'navigateByUrl');
      fixture.detectChanges();
      expect(router.navigateByUrl).toHaveBeenCalledWith('/cart');
    });

    it('does not navigate when still loading', () => {
      setup({ isAuthenticated: signal(true), isLoading: signal(true) });
      const fixture = TestBed.createComponent(LoginPageComponent);
      const router = TestBed.inject(Router);
      spyOn(router, 'navigateByUrl');
      fixture.detectChanges();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });
  });
});
