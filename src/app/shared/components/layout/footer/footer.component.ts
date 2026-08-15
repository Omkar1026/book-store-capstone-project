import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="bg-gray-900 text-gray-400 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 class="text-white font-semibold text-sm mb-3">Shop</h3>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/catalogue" class="hover:text-white transition-colors">All Books</a></li>
              <li><a routerLink="/catalogue/fiction" class="hover:text-white transition-colors">Fiction</a></li>
              <li><a routerLink="/catalogue/non-fiction" class="hover:text-white transition-colors">Non-Fiction</a></li>
              <li><a routerLink="/catalogue/science" class="hover:text-white transition-colors">Science</a></li>
            </ul>
          </div>
          <div>
            <h3 class="text-white font-semibold text-sm mb-3">Account</h3>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/auth/login" class="hover:text-white transition-colors">Sign In</a></li>
              <li><a routerLink="/auth/register" class="hover:text-white transition-colors">Register</a></li>
              <li><a routerLink="/account/orders" class="hover:text-white transition-colors">Order History</a></li>
              <li><a routerLink="/account/profile" class="hover:text-white transition-colors">Profile</a></li>
            </ul>
          </div>
          <div>
            <h3 class="text-white font-semibold text-sm mb-3">Help</h3>
            <ul class="space-y-2 text-sm">
              <li><span class="hover:text-white cursor-pointer">FAQ</span></li>
              <li><span class="hover:text-white cursor-pointer">Shipping Policy</span></li>
              <li><span class="hover:text-white cursor-pointer">Returns</span></li>
              <li><span class="hover:text-white cursor-pointer">Contact Us</span></li>
            </ul>
          </div>
          <div>
            <h3 class="text-white font-semibold text-sm mb-3">About</h3>
            <ul class="space-y-2 text-sm">
              <li><span class="hover:text-white cursor-pointer">Our Story</span></li>
              <li><span class="hover:text-white cursor-pointer">Blog</span></li>
              <li><span class="hover:text-white cursor-pointer">Careers</span></li>
              <li><span class="hover:text-white cursor-pointer">Privacy Policy</span></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-700 pt-6 text-center text-xs">
          &copy; {{ year }} BookStore. All rights reserved.
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
