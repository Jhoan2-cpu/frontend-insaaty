import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 class="text-2xl font-bold text-center mb-6">Register</h1>
        <p class="text-gray-500 text-center">Coming soon...</p>
        <a routerLink="/" class="block text-center text-blue-600 mt-4">← Back to Home</a>
      </div>
    </div>
  `
})
export class Register { }
