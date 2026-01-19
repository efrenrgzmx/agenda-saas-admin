import { Routes } from '@angular/router';
import { authGuard, guestGuard, superAdminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout/layout').then((m) => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.DashboardComponent),
      },
      {
        path: 'organizations',
        loadComponent: () => import('./pages/organizations/organizations').then((m) => m.OrganizationsComponent),
      },
      {
        path: 'organizations/:id',
        loadComponent: () =>
          import('./pages/organization-detail/organization-detail').then((m) => m.OrganizationDetailComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users').then((m) => m.UsersComponent),
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./pages/user-detail/user-detail').then((m) => m.UserDetailComponent),
      },
      {
        path: 'audit-log',
        loadComponent: () => import('./pages/audit-log/audit-log').then((m) => m.AuditLogComponent),
      },
      {
        path: 'admins',
        loadComponent: () => import('./pages/admins/admins').then((m) => m.AdminsComponent),
        canActivate: [superAdminGuard],
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings').then((m) => m.SettingsComponent),
        canActivate: [superAdminGuard],
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
