import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../components/layout/header/header.component';
import { FooterComponent } from '../components/layout/footer/footer.component';
import { ToastContainerComponent } from '../components/ui/toast-container/toast-container.component';
import { AuthStore } from '../../core/store/auth.store';
import { CartStore } from '../../core/store/cart.store';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastContainerComponent],
  template: `
    <div class="min-h-screen flex flex-col">
      <app-header />
      <main class="flex-1">
        <router-outlet />
      </main>
      <app-footer />
      <app-toast-container />
    </div>
  `
})
export class AppShellComponent {
  private readonly authStore = inject(AuthStore);
  private readonly cartStore = inject(CartStore);

  constructor() {
    effect(() => {
      const user = this.authStore.currentUser();
      if (user) {
        this.cartStore.loadCart(user.id);
      } else {
        this.cartStore.resetCart();
      }
    });
  }
}
