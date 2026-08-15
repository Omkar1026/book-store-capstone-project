import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found-page',
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 class="text-4xl font-bold">404</h1>
      <p class="text-lg text-gray-600">Page not found</p>
      <a href="/" class="text-blue-600 underline">Go home</a>
    </div>
  `
})
export class NotFoundPageComponent {}
