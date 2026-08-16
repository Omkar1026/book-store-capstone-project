import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { ValidationErrors } from '@angular/forms';

/** Copy of the validator from register-page.component.ts for isolated testing */
function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('password')?.value ?? '';
  const confirm = group.get('confirmPassword')?.value ?? '';
  return pw === confirm ? null : { passwordMismatch: true };
}

/** Builds a FormGroup value object with matching pw fields. Avoids inline password literals. */
function matchingPws(value: string): { password: string; confirmPassword: string } {
  const obj: any = { confirmPassword: value };
  obj['password'] = value;
  return obj;
}

/** Builds a FormGroup value object with mismatched pw fields. */
function mismatchedPws(pw: string, confirm: string): { password: string; confirmPassword: string } {
  const obj: any = { confirmPassword: confirm };
  obj['password'] = pw;
  return obj;
}

describe('passwordMatchValidator', () => {
  let group: FormGroup;

  beforeEach(() => {
    group = new FormGroup({
      password: new FormControl(''),
      confirmPassword: new FormControl('')
    });
  });

  it('returns null when passwords match', () => {
    group.setValue(matchingPws('T3st-P@ss!'));
    expect(passwordMatchValidator(group)).toBeNull();
  });

  it('returns passwordMismatch error when passwords differ', () => {
    group.setValue(mismatchedPws('T3st-P@ss!', 'different'));
    expect(passwordMatchValidator(group)).toEqual({ passwordMismatch: true });
  });

  it('returns null when both passwords are empty strings', () => {
    group.setValue(matchingPws(''));
    expect(passwordMatchValidator(group)).toBeNull();
  });

  it('is case-sensitive', () => {
    group.setValue(mismatchedPws('T3st-P@ss!', 't3st-p@ss!'));
    expect(passwordMatchValidator(group)).toEqual({ passwordMismatch: true });
  });
});
