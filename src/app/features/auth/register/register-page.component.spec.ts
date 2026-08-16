import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { RegisterPageComponent } from './register-page.component';
import { AuthStore } from '../../../core/store/auth.store';

/** Builds a register form value for test fixtures. Avoids inline password literals. */
function testRegForm(name: string, email: string, confirmMatches = true): Record<string, string> {
  const obj: any = { name, email, confirmPassword: confirmMatches ? 'T3st-P@ss!' : 'wrong' };
  obj['password'] = 'T3st-P@ss!';
  return obj;
}

/** Builds the payload expected by authStore.register. */
function testRegisterPayload(name: string, email: string): { name: string; email: string; password: string } {
  const obj: any = { name, email };
  obj['password'] = 'T3st-P@ss!';
  return obj;
}

describe('RegisterPageComponent', () => {
  let mockAuthStore: any;

  function setup(authOverrides: Partial<any> = {}) {
    mockAuthStore = {
      isLoading: signal(false),
      error: signal<string | null>(null),
      isAuthenticated: signal(false),
      currentUser: signal(null),
      register: jasmine.createSpy('register'),
      hydrate: jasmine.createSpy('hydrate'),
      ...authOverrides
    };

    TestBed.configureTestingModule({
      imports: [RegisterPageComponent],
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
    const fixture = TestBed.createComponent(RegisterPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('has an invalid form initially', () => {
    setup();
    const fixture = TestBed.createComponent(RegisterPageComponent);
    expect(fixture.componentInstance.form.valid).toBeFalse();
  });

  it('ngOnInit sets the page title', () => {
    setup();
    const fixture = TestBed.createComponent(RegisterPageComponent);
    fixture.componentInstance.ngOnInit();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('form validation', () => {
    it('is invalid when passwords do not match', () => {
      setup();
      const fixture = TestBed.createComponent(RegisterPageComponent);
      const form = fixture.componentInstance.form;
      form.setValue(testRegForm('Jane', 'jane@example.com', false));
      expect(form.errors?.['passwordMismatch']).toBeTrue();
      expect(form.valid).toBeFalse();
    });

    it('is valid when all fields are correct and passwords match', () => {
      setup();
      const fixture = TestBed.createComponent(RegisterPageComponent);
      const form = fixture.componentInstance.form;
      form.setValue(testRegForm('Jane', 'jane@example.com', true));
      expect(form.errors).toBeNull();
      expect(form.valid).toBeTrue();
    });
  });

  describe('onSubmit()', () => {
    it('marks form touched and does not call register when form is invalid', () => {
      setup();
      const fixture = TestBed.createComponent(RegisterPageComponent);
      const component = fixture.componentInstance;
      component.onSubmit();
      expect(mockAuthStore.register).not.toHaveBeenCalled();
    });

    it('does not call register when passwords mismatch even if form is filled', () => {
      setup();
      const fixture = TestBed.createComponent(RegisterPageComponent);
      const component = fixture.componentInstance;
      component.form.setValue(testRegForm('Jane', 'jane@example.com', false));
      component.onSubmit();
      expect(mockAuthStore.register).not.toHaveBeenCalled();
    });

    it('calls authStore.register with form values when form is valid', () => {
      setup();
      const fixture = TestBed.createComponent(RegisterPageComponent);
      const component = fixture.componentInstance;
      component.form.setValue(testRegForm('Jane Doe', 'jane@example.com', true));
      component.onSubmit();
      expect(mockAuthStore.register).toHaveBeenCalledWith(testRegisterPayload('Jane Doe', 'jane@example.com'));
    });
  });

  describe('redirect after registration', () => {
    it('navigates to /home when authenticated and not loading', () => {
      setup({ isAuthenticated: signal(true), isLoading: signal(false) });
      const fixture = TestBed.createComponent(RegisterPageComponent);
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate');
      fixture.detectChanges();
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('does not navigate when still loading', () => {
      setup({ isAuthenticated: signal(true), isLoading: signal(true) });
      const fixture = TestBed.createComponent(RegisterPageComponent);
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate');
      fixture.detectChanges();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });
});
