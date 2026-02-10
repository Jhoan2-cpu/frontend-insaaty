import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/homepage/homepage').then(m => m.Homepage),
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then(m => m.Login),
    },
    {
        path: 'register',
        loadComponent: () => import('./pages/register/register').then(m => m.Register),
    },
    {
        path: '',
        loadComponent: () => import('./components/layout/layout').then(m => m.Layout),
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),
                data: { title: 'SIDEBAR.DASHBOARD' }
            },
            {
                path: 'inventory',
                children: [
                    {
                        path: '',
                        redirectTo: 'products',
                        pathMatch: 'full'
                    },
                    {
                        path: 'products',
                        loadComponent: () => import('./pages/inventory/inventory').then(m => m.Inventory),
                        data: { title: 'INVENTORY.TITLE' }
                    },
                    {
                        path: 'transactions',
                        loadComponent: () => import('./pages/inventory/transactions/transactions').then(m => m.Transactions),
                        data: { title: 'INVENTORY.HISTORY' }
                    },
                    {
                        path: 'movements/new',
                        loadComponent: () => import('./pages/inventory/movement-create/movement-create').then(m => m.MovementCreate),
                        data: { title: 'INVENTORY.MOVEMENT_TITLE' }
                    }
                ]
            },
            {
                path: 'orders',
                loadComponent: () => import('./pages/orders/orders').then(m => m.Orders),
                data: { title: 'SIDEBAR.ORDERS' }
            },
            {
                path: 'reports',
                loadComponent: () => import('./pages/reports/reports').then(m => m.Reports),
                data: { title: 'REPORTS.TITLE' }
            },
            {
                path: 'suppliers',
                loadComponent: () => import('./pages/suppliers/suppliers').then(m => m.Suppliers),
                data: { title: 'SIDEBAR.SUPPLIERS' }
            },
            {
                path: 'settings',
                loadComponent: () => import('./pages/settings/settings').then(m => m.Settings),
                data: { title: 'SETTINGS.TITLE' }
            },
        ]
    },
    {
        path: '**',
        loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
    },
];
