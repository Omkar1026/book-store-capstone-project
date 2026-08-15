import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-0.5" [attr.aria-label]="rating() + ' out of 5 stars'">
      @for (star of stars; track $index) {
        <svg
          [class.text-yellow-400]="$index < fullStars"
          [class.text-gray-300]="$index >= fullStars"
          class="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      }
      @if (showCount() && reviewCount() > 0) {
        <span class="ml-1 text-xs text-gray-500">({{ reviewCount() }})</span>
      }
    </div>
  `
})
export class StarRatingComponent {
  readonly rating = input<number>(0);
  readonly reviewCount = input<number>(0);
  readonly showCount = input<boolean>(true);

  readonly stars = Array(5).fill(0);

  get fullStars(): number {
    return Math.round(this.rating());
  }
}
