import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./homepage/homepage.component').then((m) => m.HomepageComponent),
  },
  {
    path: 'config',
    loadComponent: () =>
      import('./config/config.component').then((m) => m.ConfigComponent),
  },
];
