import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute, RouterModule, PRIMARY_OUTLET } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface Breadcrumb {
    label: string;
    url: string;
}

@Component({
    selector: 'app-breadcrumbs',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslateModule],
    template: `
    <nav class="flex px-4 sm:px-6 lg:px-8 py-3 bg-white border-b border-gray-100" aria-label="Breadcrumb">
      <ol class="inline-flex items-center space-x-1 md:space-x-2">
        <!-- Home Icon -->
        <li class="inline-flex items-center">
          <a routerLink="/dashboard" class="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
            <i class="fas fa-home mr-2"></i>
            {{ 'SIDEBAR.DASHBOARD' | translate }}
          </a>
        </li>

        <!-- Dynamic Breadcrumbs -->
        <li *ngFor="let breadcrumb of breadcrumbs; let last = last">
          <div class="flex items-center">
            <i class="fas fa-chevron-right text-gray-400 text-xs mx-1"></i>
            <a *ngIf="!last" [routerLink]="breadcrumb.url" 
               class="ml-1 text-sm font-medium text-gray-500 hover:text-blue-600 md:ml-2 transition-colors">
              {{ breadcrumb.label | translate }}
            </a>
            <span *ngIf="last" class="ml-1 text-sm font-medium text-gray-900 md:ml-2" aria-current="page">
              {{ breadcrumb.label | translate }}
            </span>
          </div>
        </li>
      </ol>
    </nav>
  `
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {
    breadcrumbs: Breadcrumb[] = [];
    private destroy$ = new Subject<void>();

    constructor(private router: Router, private activatedRoute: ActivatedRoute) { }

    ngOnInit() {
        // Initial load
        this.breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);

        // Listen to changes
        this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                takeUntil(this.destroy$)
            )
            .subscribe(() => {
                this.breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private createBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
        const children: ActivatedRoute[] = route.children;

        if (children.length === 0) {
            return breadcrumbs;
        }

        for (const child of children) {
            if (child.outlet !== PRIMARY_OUTLET) {
                continue;
            }

            const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
            if (routeURL !== '') {
                url += `/${routeURL}`;
            }

            // Verify if custom data is available
            const label = child.snapshot.data['breadcrumb'] || child.snapshot.data['title'];

            // Don't add breadcrumb if no label or if it's the dashboard (handled manually as home)
            if (label && label !== 'SIDEBAR.DASHBOARD') {
                breadcrumbs.push({ label, url });
            }

            return this.createBreadcrumbs(child, url, breadcrumbs);
        }

        return breadcrumbs;
    }
}
