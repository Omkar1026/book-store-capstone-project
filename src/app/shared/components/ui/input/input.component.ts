import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-1">
      @if (label()) {
        <label class="text-sm font-medium text-gray-700">
          {{ label() }}
          @if (required()) {
            <span class="text-red-500 ml-0.5">*</span>
          }
        </label>
      }
      <ng-content />
      @if (control() && control()!.invalid && control()!.touched) {
        <p class="text-xs text-red-500 mt-0.5">
          @if (control()!.errors?.['required']) { This field is required. }
          @else if (control()!.errors?.['email']) { Enter a valid email address. }
          @else if (control()!.errors?.['minlength']) {
            Minimum {{ control()!.errors?.['minlength']?.requiredLength }} characters required.
          }
          @else if (control()!.errors?.['passwordMismatch']) { Passwords do not match. }
          @else if (hint()) { {{ hint() }} }
        </p>
      }
    </div>
  `
})
export class InputComponent {
  readonly label = input<string>('');
  readonly required = input<boolean>(false);
  readonly hint = input<string>('');
  readonly control = input<AbstractControl | null>(null);
}
