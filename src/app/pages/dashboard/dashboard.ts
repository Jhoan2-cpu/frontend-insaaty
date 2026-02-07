import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <div class="min-h-screen bg-gray-100 p-8">
      <h1 class="text-2xl font-bold mb-6">Dashboard</h1>
      <p class="text-gray-500">Coming soon...</p>
      <a routerLink="/" class="text-blue-600 mt-4 inline-block">← Back to Home</a>
    </div>
  `
})
export class Dashboard { }
