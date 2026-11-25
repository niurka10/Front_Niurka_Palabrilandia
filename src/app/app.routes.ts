import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout';

export const routes: Routes = [
  { path: '', redirectTo: 'learning', pathMatch: 'full' },
  {
    path: 'learning',
    loadComponent: () =>
      import('./features/learning/pages/learning-selection-page')
        .then(m => m.LearningSelectionPage)
  },
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-page').then(m => m.DashboardPage)
      },
      {
        path: 'spelling',
        loadComponent: () =>
          import('./features/spelling/pages/spelling-page').then(m => m.SpellingPage)
      },
      {
        path: 'reading',
        loadComponent: () =>
          import('./features/reading/pages/reading-page').then(m => m.ReadingPage)
      },
      {
        path: 'ar',
        loadComponent: () =>
          import('./features/ar/pages/ar-page').then(m => m.ArPage)
      }
    ]
  },
  { path: '**', redirectTo: 'learning' }
];