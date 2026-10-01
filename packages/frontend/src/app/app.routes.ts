import { Route } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'rutina',
    loadComponent: () => import('./features/training/routine').then((m) => m.Routine),
    canActivate: [authGuard],
  },
  {
    path: 'comida',
    loadComponent: () => import('./features/food/food-log').then((m) => m.FoodLogPage),
    canActivate: [authGuard],
  },
  {
    path: 'peso',
    loadComponent: () => import('./features/weight/weight-log').then((m) => m.WeightLogPage),
    canActivate: [authGuard],
  },
  {
    path: 'actividad',
    loadComponent: () =>
      import('./features/garmin/garmin-activity').then((m) => m.GarminActivityPage),
    canActivate: [authGuard],
  },
  {
    path: 'progreso',
    loadComponent: () => import('./features/progress/progress').then((m) => m.ProgressPage),
    canActivate: [authGuard],
  },
  {
    path: 'check-diario',
    loadComponent: () =>
      import('./features/daily-check/daily-check').then((m) => m.DailyCheckPage),
    canActivate: [authGuard],
  },
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [authGuard],
  },
];
