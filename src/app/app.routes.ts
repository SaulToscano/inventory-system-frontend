import { Routes } from '@angular/router';
import { AppLayout } from './layout/app-layout/app-layout';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },
  {
    path: '',
    component: AppLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'products',
        loadComponent: () => import('./features/inventory/product-list/product-list')
          .then(m => m.ProductList)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
